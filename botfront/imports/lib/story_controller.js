import { undefinedFieldMessage } from 'graphql/validation/rules/FieldsOnCorrectType';

export const NEW_INTENT = 'new_intent_inserted_by_visual_story_editor';

class StoryException {
    constructor(type, message, line, code) {
        this.type = type;
        this.line = line;
        this.message = message;
        this.code = code;
    }
}

const RASA_BUILT_IN_ACTIONS = [
    'action_listen',
    'action_restart',
    'action_session_start',
    'action_default_fallback',
    'action_deactivate_form',
    'action_revert_fallback_events',
    'action_default_ask_affirmation',
    'action_default_ask_rephrase',
    'action_back',
];

export class StoryController {
    constructor({
        story, isASmartStory, slots, onUpdate = () => { }, onMdType = () => { }, isABranch = false, forms = [], requestedSlotActive = false, triggerRules = [], type = 'story',
    }) {
        this.domain = {
            slots: this.getSlots(slots),
            forms: new Set(forms.map(({ name }) => name)),
        };
        this.md = story;
        this.isSmartStory = isASmartStory;
        this.isABranch = isABranch;
        this.onMdType = onMdType; // onMdType what happens when we need to notify update without saving
        this.saveUpdate = options => onUpdate({ story: this.md, type: this.isABranch ? undefined : this.type }, options);
        this.requestedSlotActive = requestedSlotActive;
        this.triggerRules = triggerRules;
        this.type = type;

        this.validateStory(false);
    }

    getSlots = (slots) => {
        const slotsToAdd = {};
        if (!slots) return {};
        slots.forEach((slot) => {
            const options = {};
            if (slot.minValue) options.min_value = slot.minValue;
            if (slot.maxValue) options.max_value = slot.maxValue;
            if (slot.initialValue) options.initial_value = slot.initialValue;
            if (slot.categories) options.values = slot.categories;
            slotsToAdd[slot.name] = {
                type: slot.type,
                ...options,
            };
        });
        return slotsToAdd;
    }

    updateSlots = (slots) => {
        this.domain.slots = this.getSlots(slots);
        this.validateStory(false);
    }

    updateForms = (forms) => {
        this.domain.forms = new Set(forms.map(({ name }) => name));
        this.validateStory(false);
    }

    setIsBranch = (isABranch) => {
        this.isABranch = isABranch;
        this.validateStory(false);
        this.onMdType();
    }

    splitLines = () => (
        this.md.split('\n')
            .filter(l => l.trim() !== '')
            .map(l => ({ md: l, gui: {} }))
    )

    hasInvalidChars = (str) => {
        if (str.match(/[ /]/)) {
            this.raiseStoryException('invalid_char');
            return true;
        }
        return false;
    };

    raiseStoryException = (code) => {
        // disabled exceptions
        this.exceptions.push(new StoryException(...this.exceptionMessages[code], this.idx + 1, code));
    };

    validateUtter = () => {
        this.form = null;
        if (!this.hasInvalidChars(this.response)) {
            this.domain.actions.add(this.response);
            this.lines[this.idx].gui = { type: 'bot', data: { name: this.response } };
        }
    };

    validateEllipsis = () => {
        this.form = null;
        this.lines[this.idx].gui = { type: 'ellipsis', data: { name: '- ...' } };
    };

    validateAction = () => {
        this.form = null;
        this.lines[this.idx].gui = { type: 'action', data: { name: this.response } };
    };

    validateFormDecl = () => {
        this.form = this.response;
        if (!this.hasInvalidChars(this.response)) {
            this.lines[this.idx].gui = { type: 'form_decl', data: { name: this.response } };
            if (!this.domain.forms.has(this.response)) {
                this.domain.forms.add(this.response);
                this.raiseStoryException('no_such_form');
            }
        }
    };

    validateForm = () => {
        let props;
        try {
            props = JSON.parse(/([^{]*) *({.*}|)/.exec(this.response).slice(2, 3));
        } catch (e) {
            this.raiseStoryException('form');
            return;
        }
        this.lines[this.idx].gui = { type: 'form', data: { name: props.name } };
        if (!{}.hasOwnProperty.call(props, 'name')) {
            this.raiseStoryException('form');
        } else if (![this.form, null].includes(props.name)) {
            this.raiseStoryException('declare_form');
        } else {
            this.form = null;
            if (!this.domain.forms.has(props.name) && props.name !== null) {
                this.domain.forms.add(props.name);
                this.raiseStoryException('no_such_form');
            }
        }
    };

    validateSlot = () => {
        let slotName; let slotValue; let rest;
        try {
            const props = JSON.parse(/([^{]*) *({.*}|)/.exec(this.response).slice(2, 3));
            [slotName, ...rest] = Object.keys(props);
            slotValue = props[slotName];
        } catch (e) {
            this.raiseStoryException('slot');
            return;
        }
        if (rest.length) { this.raiseStoryException('slot'); return; } // should only have one key (slot name)

        const slot = this.domain.slots[slotName] || {};
        this.lines[this.idx].gui = { type: 'slot', data: { name: slotName, type: slot.type, slotValue } };

        if ((!{}.hasOwnProperty.call(this.domain.slots, slotName) && (!this.requestedSlotActive || slotName !== 'requested_slot'))) { this.raiseStoryException('no_such_slot'); return; }
        if (slot.type === 'bool' && typeof slotValue !== 'boolean') this.raiseStoryException('bool_slot');
        else if (slot.type === 'text' && !(slotValue === null || typeof slotValue === 'string')) this.raiseStoryException('text_slot');
        else if (slot.type === 'float' && !(slotValue === null || typeof slotValue === 'number')) this.raiseStoryException('float_slot');
        else if (slot.type === 'list' && !Array.isArray(slotValue)) this.raiseStoryException('list_slot');
        else if (slot.type === 'categorical' && ![...slot.values, null].includes(slotValue)) this.raiseStoryException('cat_slot');
    };

    exceptionMessages = {
        no_empty: ['error', 'Don\'t leave story empty.'],
        prefix: ['error', 'Lines should start with `* ` or `- `.'],
        invalid_char: ['error', 'Found an invalid character.'],
        intent: ['error', 'User utterances should look like this: `* MyIntent` or `* MyIntent{"entity": "value"}`.'],
        form: ['error', 'Form calls should look like this: `- form{"name": "MyForm"}`.'],
        slot: ['error', 'Slot calls should look like this: `- slot{"slot_name": "slot_value"}`.'],
        no_such_slot: ['warning', 'Slot was not found. Have you defined it?'],
        no_such_form: ['warning', 'Form was not found. Have you defined it?'],
        bool_slot: ['error', 'Expected a boolean value for this slot.'],
        text_slot: ['error', 'Expected a text value for this slot.'],
        float_slot: ['error', 'Expected a numerical value for this slot.'],
        list_slot: ['error', 'Expected a list value for this slot.'],
        cat_slot: ['error', 'Expected a valid categorical value for this slot.'],
        action_name: ['error', 'Bot actions should look like this: `- action_...`, `- utter_...`, `- slot{...}` or `- form{...}`.'],
        have_intent: ['warning', 'Bot actions should usually be found in a user utterance block.'],
        empty_intent: ['warning', 'User utterance block closed without defining any bot action.'],
        multiple_ellipsis: ['error', 'Ellipsis can not be adjacent to each other.'],
        declare_form: ['warning', 'Form calls (`- form{"name": "myform_form"}`) should be preceded by matching `- myform_form`.'],
        smart_story_payload: ['error', 'Smart stories are triggered automatically and must not start with a user utterance'],
    };

    validateIntent = () => {
        if (this.intent && !this.response) this.raiseStoryException('empty_intent');
        this.intent = this.content.split(' OR ').map(disj => disj.trim());
        this.response = null;
        this.form = null;
        try {
            const intentData = [];
            this.intent.forEach((disj) => {
                let intent;
                let entities;
                let entityPairs;
                try {
                    [intent, entities] = /([^{]*) *({.*}|)/.exec(disj).slice(1, 3);
                    entityPairs = entities && entities !== '' ? Object.entries(JSON.parse(entities)) : [];
                } catch (e) {
                    this.raiseStoryException('intent');
                    throw new Error();
                }
                if (this.hasInvalidChars(intent)) throw new Error();
                if (intent === NEW_INTENT) {
                    intentData.push(null);
                } else {
                    this.domain.intents.add(intent);
                    entityPairs
                        .map(e => e[0])
                        .forEach(entity => this.domain.entities.add(entity));
                    intentData.push({
                        intent,
                        entities: entityPairs.map(e => ({ entity: e[0], value: e[1] })),
                    });
                }
            });
            this.lines[this.idx].gui = { type: 'user', data: intentData };
        } catch (e) {
            // already caught
        }
    };

    validateResponse = () => {
        this.response = this.content.trim();
        if (!this.intent && !this.isABranch && !this.isSmartStory && !this.response.match(/^\.\.\./)) this.raiseStoryException('have_intent');
        if (this.response.match(/^utter_/)) {
            this.validateUtter();
        } else if (this.response.match(/^action_/)) {
            this.validateAction();
        } else if (this.response.match(/_form$/)) {
            this.validateFormDecl();
        } else if (this.response.match(/^slot *{/)) {
            this.validateSlot();
        } else if (this.response.match(/^form *{/)) {
            this.validateForm();
        } else if (this.response.match(/^\.\.\./)) {
            this.validateEllipsis();
        } else {
            this.raiseStoryException('action_name');
        }
    };

    validateStory = (save = true) => {
        this.reset();
        this.validateLines();
        if (save) this.saveUpdate();
    };

    convertToFragment = () => {
        this.type = 'rule';
        this.validateStory();
    }

    convertToStory = () => {
        const storyLines = this.lines.filter(line => !/-\s\.\.\./.test(line.md));// keep the lines if they do not match - ...
        this.lines = storyLines;
        this.type = 'story';
        this.linesToMd();
        this.validateStory();
    }

    switchType = () => {
        if (this.type === 'story') {
            this.convertToFragment();
        } else {
            this.convertToStory();
        }
    }

    validateLines = () => {
        let isPreviousLineEllipsis = false; // we cannot have two ellipsis next to each other, this variable track the previous line
        for (this.idx; this.idx < this.lines.length; this.idx += 1) {
            const line = this.lines[this.idx].md.replace(/ *<!--.*--> */g, ' ');
            if (line.trim().length !== 0) {
                try {
                    [this.prefix, this.content] = /(^ *\* |^ *- )(.*)/.exec(line).slice(1, 3);
                    this.prefix = this.prefix.trim();
                    if (this.prefix === '*') {
                        // new intent
                        isPreviousLineEllipsis = false;
                        this.validateIntent();
                    } else if (this.prefix === '-') {
                        const isLineEllipsis = this.content === '...';
                        if (isLineEllipsis && isPreviousLineEllipsis) {
                            this.raiseStoryException('multiple_ellipsis');
                        }
                        isPreviousLineEllipsis = isLineEllipsis;

                        // new response
                        this.validateResponse();
                    }
                } catch (e) {
                    this.raiseStoryException('prefix');
                }
            }
        }
    }

    reset = () => {
        this.domain = {
            entities: new Set(),
            intents: new Set(),
            actions: new Set(),
            slots: this.domain.slots,
            forms: this.domain.forms,
        };
        this.prefix = null;
        this.content = null;
        this.intent = null;
        this.response = null;
        this.form = null;
        this.exceptions = [];
        this.idx = 0;
        this.lines = this.splitLines();
    }

    toMd = (line) => {
        try {
            if (['action', 'bot', 'form_decl', 'ellipsis'].includes(line.type)) return `  - ${line.data.name}`;
            if (line.type === 'form') {
                let { name } = line.data;
                name = name === null ? name : `"${name}"`;
                return `  - form{"name":${name}}`;
            }
            if (line.type === 'slot') {
                const newLine = {};
                newLine[line.data.name] = line.data.slotValue;
                return `  - slot${JSON.stringify(newLine)}`;
            }
            if (line.type === 'user') {
                if (!line.data) return false;
                const disjuncts = line.data.map((d) => {
                    const entities = (d.entities || [])
                        .filter(e => e instanceof Object); // filter odd undefined entities
                    if (!entities.length) return d.intent;
                    return `${d.intent}{${entities.map(({ entity, value }) => `"${entity}": "${value}"`).join(', ')}}`;
                });
                return `* ${disjuncts.join(' OR ')}`;
            }
        } catch (e) { return false; }
        return false;
    }

    generateMdLine = (content) => {
        const md = this.toMd(content) || '';
        return { gui: content, md };
    }

    deleteLine = (i) => {
        this.lines = [...this.lines.slice(0, i), ...this.lines.slice(i + 1)];
        this.linesToMd();
        this.validateStory();
    };

    insertLine = (i, content) => {
        const newMdLine = this.generateMdLine(content);
        this.lines = [...this.lines.slice(0, i + 1), newMdLine, ...this.lines.slice(i + 1)];
        this.linesToMd();
        this.validateStory();
    };

    replaceLine = (i, content) => {
        const newMdLine = this.generateMdLine(content);
        if (!newMdLine) return;
        this.lines = [...this.lines.slice(0, i), newMdLine, ...this.lines.slice(i + 1)];
        this.linesToMd();
        this.validateStory();
    };

    linesToMd = () => {
        this.md = this.lines.map(l => l.md).join('\n');
    }

    setMd = (content) => {
        this.md = content;
        this.validateStory(false);
        this.onMdType();
    }

    getErrors = () => this.exceptions.filter(exception => exception.type === 'error');

    getWarnings = () => this.exceptions.filter(exception => exception.type === 'warning');

    getPossibleInsertions = (i) => {
        const possibleInsertions = {
            userUtterance: true,
            botUtterance: true,
            action: true,
            slot: true,
            form: true,
            ellipsis: true,
        };
        const [prev, next] = [this.lines[i], this.lines[i + 1]];
        if ((prev && prev.gui.type === 'user') || (next && next.gui.type === 'user')) {
            return { ...possibleInsertions, userUtterance: false };
        }
        if ((prev && prev.gui.type === 'ellipsis') || (next && next.gui.type === 'ellipsis')) {
            return { ...possibleInsertions, ellipsis: false };
        }
        return possibleInsertions;
    }

    extractDomain = () => {
        const errors = this.getErrors();
        if (errors.length > 0) {
            throw new Error(`Error at line ${errors[0].line}: ${errors[0].message}`);
        }
        const intentsWithSmartTriggers = this.domain.intents;
        this.triggerRules.forEach(t => intentsWithSmartTriggers.add(t.payload.substring(1)));
        return { ...this.domain, intents: intentsWithSmartTriggers };
    };

    setIsSmart = (isSmartStory) => {
        this.isSmartStory = isSmartStory;
        this.validateStory(false);
    }
}

export const stringPayloadToObject = function (stringPayload = '') {
    const payloadRegex = /([^{]*) *({.*}|)/;
    const matches = payloadRegex.exec(stringPayload.substring(1));
    const intent = matches[1];
    let entities = matches[2];
    const objectPayload = {
        intent,
        entities: [],
    };
    if (entities && entities !== '') {
        const parsed = JSON.parse(entities);
        entities = Object.keys(parsed).map(key => ({ entity: key, value: parsed[key] }));
    } else {
        entities = [];
    }
    objectPayload.entities = entities;
    return objectPayload;
};

export const objectPayloadToString = function ({ intent, entities }) {
    const entitiesMap = entities ? entities.reduce((map, obj) => (map[obj.entity] = obj.value, map), {}) : {};
    const entitiesString = Object.keys(entitiesMap).length > 0 ? JSON.stringify(entitiesMap) : '';
    return `/${intent}${entitiesString}`;
};
