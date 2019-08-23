import { safeDump as yamlDump } from 'js-yaml';

class StoryException {
    constructor(type, message, line, code) {
        this.type = type;
        this.line = line;
        this.message = message;
        this.code = code;
    }
}

export class StoryController {
    constructor(story, slots, notifyUpdate = () => {}, saveUpdate = null) {
        this.domain = {
            slots: this.getSlots(slots),
        };
        this.md = story;
        this.notifyUpdate = notifyUpdate;
        this.saveUpdate = saveUpdate;
        this.validateStory();
    }

    getSlots = (slots) => {
        const slotsToAdd = {};
        if (!slots) return {};
        slots.forEach((slot) => {
            const options = {};
            const { type } = slot;
            if (type === 'float') {
                if (slot.minValue) {
                    options.minValue = slot.minValue;
                }
                if (slot.maxValue) {
                    options.maxValue = slot.maxValue;
                }
            }
            if (slot.initialValue) {
                options.initial_value = slot.initialValue;
            }
            if (type === 'categorical' && slot.categories) {
                options.values = slot.categories;
            }
            slotsToAdd[slot.name] = {
                type: slot.type,
                ...options,
            };
        });
        return slotsToAdd;
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
        this.exceptions.push(new StoryException(...this.exceptionMessages[code], this.idx + 1, code));
    };

    validateUtter = () => {
        this.form = null;
        if (!this.hasInvalidChars(this.response)) {
            this.domain.actions.add(this.response);
            this.domain.templates[this.response] = '';
            this.lines[this.idx].gui = { type: 'bot', data: { name: this.response } };
        }
    };

    validateAction = () => {
        this.form = null;
        if (!this.hasInvalidChars(this.response)) {
            this.domain.actions.add(this.response);
            this.lines[this.idx].gui = { type: 'action', data: { name: this.response } };
        }
    };

    validateFormDecl = () => {
        this.form = this.response;
        if (!this.hasInvalidChars(this.response)) {
            this.domain.forms.add(this.response);
            this.lines[this.idx].gui = { type: 'form_decl', data: { name: this.response } };
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
        if (!{}.hasOwnProperty.call(props, 'name')) {
            this.raiseStoryException('form');
        } else if (this.form !== props.name) {
            this.raiseStoryException('declare_form');
        } else {
            this.form = null;
            this.lines[this.idx].gui = { type: 'form', data: { name: props.name } };
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
        if (!{}.hasOwnProperty.call(this.domain.slots, slotName)) { this.raiseStoryException('no_such_slot'); return; }

        const slot = this.domain.slots[slotName];
        if (slot.type === 'bool' && typeof slotValue !== 'boolean') this.raiseStoryException('bool_slot');
        else if (slot.type === 'text' && typeof slotValue !== 'string') this.raiseStoryException('text_slot');
        else if (slot.type === 'float' && typeof slotValue !== 'number') this.raiseStoryException('float_slot');
        else if (slot.type === 'categorical' && !slot.values.includes(slotValue)) this.raiseStoryException('cat_slot');
        else this.lines[this.idx].gui = { type: 'slot', data: { name: slotName, type: slot.type, slotValue } };
    };

    exceptionMessages = {
        no_empty: ['error', 'Don\'t leave story empty.'],
        prefix: ['error', 'Lines should start with `* ` or `- `.'],
        invalid_char: ['error', 'Found an invalid character.'],
        intent: ['error', 'User utterances should look like this: `* MyIntent` or `* MyIntent{"entity": "value"}`.'],
        form: ['error', 'Form calls should look like this: `- form{"name": "MyForm"}`.'],
        slot: ['error', 'Slot calls should look like this: `- slot{"slot_name": "slot_value"}`.'],
        no_such_slot: ['error', 'Slot was not found. Have you defined it?'],
        bool_slot: ['error', 'Expected a boolean value for this slot.'],
        text_slot: ['error', 'Expected a text value for this slot.'],
        float_slot: ['error', 'Expected a numerical value for this slot.'],
        cat_slot: ['error', 'Expected a valid categorical value for this slot.'],
        action_name: ['error', 'Bot actions should look like this: `- action_...`, `- utter_...`, `- slot{...}` or `- form{...}`.'],
        have_intent: ['warning', 'Bot actions should usually be found in a user utterance block.'],
        empty_intent: ['warning', 'User utterance block closed without defining any bot action.'],
        declare_form: ['warning', 'Form calls (`- form{"name": "myform_form"}`) should be preceded by matching `- myform_form`.'],
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
                this.domain.intents.add(intent);
                entityPairs
                    .map(e => e[0])
                    .forEach(entity => this.domain.entities.add(entity));
                intentData.push({
                    intent,
                    entities: entityPairs.map(e => ({ entity: e[0], value: e[1] })),
                });
            });
            this.lines[this.idx].gui = { type: 'user', data: intentData };
        } catch (e) {
            // already caught
        }
    };

    validateResponse = () => {
        if (!this.intent) this.raiseStoryException('have_intent');
        this.response = this.content.trim();
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
        } else {
            this.raiseStoryException('action_name');
        }
    };

    validateStory = () => {
        this.reset();
        // if (!this.md.replace(/\s/g, '').length) this.raiseStoryException('no_empty');
        for (this.idx; this.idx < this.lines.length; this.idx += 1) {
            const line = this.lines[this.idx].md.replace(/ *<!--.*--> */g, ' ');
            if (line.trim().length !== 0) {
                try {
                    [this.prefix, this.content] = /(^ *\* |^ *- )(.*)/.exec(line).slice(1, 3);
                    this.prefix = this.prefix.trim();
                    if (this.prefix === '*') {
                        // new intent
                        this.validateIntent();
                    } else if (this.prefix === '-') {
                        // new response
                        this.validateResponse();
                    }
                } catch (e) {
                    this.raiseStoryException('prefix');
                }
            }
        }
    };

    reset = () => {
        this.domain = {
            entities: new Set(),
            intents: new Set(),
            actions: new Set(),
            slots: this.domain.slots,
            forms: new Set(),
            templates: {},
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
            if (['action', 'bot'].includes(line.type)) return `  - ${line.data.name}`;
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
        const mdContent = this.toMd(content);
        if (!mdContent) return { gui: content, md: '' };
        return { gui: content, md: this.toMd(content) };
    }

    deleteLine = (i) => {
        this.lines = [...this.lines.slice(0, i), ...this.lines.slice(i + 1)];
        this.md = this.lines.map(l => l.md).join('\n');
        this.validateStory();
        if (this.saveUpdate) this.saveUpdate(this.md);
        else this.notifyUpdate();
    };

    insertLine = (i, content) => {
        const newMdLine = this.generateMdLine(content);
        if (!newMdLine) return;
        this.lines = [...this.lines.slice(0, i + 1), newMdLine, ...this.lines.slice(i + 1)];
        this.md = this.lines.map(l => l.md).join('\n');
        if (this.saveUpdate && content.data && content.data !== [null]) this.saveUpdate(this.md);
        else this.notifyUpdate();
    };

    replaceLine = (i, content) => {
        const newMdLine = this.generateMdLine(content);
        if (!newMdLine) return;
        this.lines = [...this.lines.slice(0, i), newMdLine, ...this.lines.slice(i + 1)];
        this.md = this.lines.map(l => l.md).join('\n');
        this.validateStory();
        if (this.saveUpdate && content.data && content.data !== [null]) this.saveUpdate(this.md);
        else this.notifyUpdate();
    };

    setMd = (content) => {
        this.md = content;
        this.validateStory();
        if (this.saveUpdate) this.saveUpdate(this.md);
    }

    getPossibleInsertions = (i) => {
        const possibleInsertions = {
            userUtterance: true,
            botUtterance: true,
            action: true,
            slot: true,
        };
        const [prev, next] = [this.lines[i], this.lines[i + 1]];
        if ((prev && prev.gui.type === 'user') || (next && next.gui.type === 'user')) {
            return { ...possibleInsertions, userUtterance: false };
        }
        return possibleInsertions;
    }

    extractDomain = () => {
        const errors = this.exceptions.filter(exception => exception.type === 'error');
        if (errors.length > 0) {
            throw new Error(`Error at line ${errors[0].line}: ${errors[0].message}`);
        }
        return this.domain;
    };

    extractDialogAct = () => {
        const initRegex = /^\* *(.*)/;
        const initPayload = initRegex.exec(this.lines[0])[1];
        this.payloads = initPayload.split(' OR ').map(disj => disj.trim());
        this.response = null;
        this.form = null;
        const payloadRegex = /([^{]*) *({.*}|)/;
        const output = [];
        try {
            this.payloads.forEach((stringPayload) => {
                const matches = payloadRegex.exec(stringPayload);
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
                output.push({ objectPayload, stringPayload: `/${stringPayload}` });
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
        }
        return output;
    };
}
function addSlots(slots) {
    const slotsToAdd = {};
    if (!slots) return {};
    slots.forEach((slot) => {
        const options = {};
        const { type } = slot;
        if (type === 'float') {
            if (slot.minValue) {
                options.minValue = slot.minValue;
            }
            if (slot.maxValue) {
                options.maxValue = slot.maxValue;
            }
        }
        if (slot.initialValue) {
            options.initial_value = slot.initialValue;
        }
        if (type === 'categorical' && slot.categories) {
            options.values = slot.categories;
        }
        slotsToAdd[slot.name] = {
            type: slot.type,
            ...options,
        };
    });
    return slotsToAdd;
}

export const extractDomain = (stories, slots) => {
    const defaultDomain = {
        actions: new Set(['utter_fallback', 'utter_default']),
        intents: new Set(),
        entities: new Set(),
        forms: new Set(),
        templates: {
            utter_default: '',
            utter_fallback: '',
        },
        slots: {
            latest_response_name: { type: 'unfeaturized' },
            followup_response_name: { type: 'unfeaturized' },
            parse_data: { type: 'unfeaturized' },
            ...addSlots(slots),
        },
    };
    let domains = stories.map((story) => {
        const val = new StoryController(story, slots);
        val.validateStory();
        try {
            return val.extractDomain();
        } catch (e) {
            return {
                entities: [], intents: [], actions: [], forms: [], templates: [], slots: [],
            };
        }
    });
    domains = domains.reduce(
        (d1, d2) => ({
            entities: new Set([...d1.entities, ...d2.entities]),
            intents: new Set([...d1.intents, ...d2.intents]),
            actions: new Set([...d1.actions, ...d2.actions]),
            forms: new Set([...d1.forms, ...d2.forms]),
            templates: { ...d1.templates, ...d2.templates },
            slots: { ...d1.slots, ...d2.slots },
        }),
        defaultDomain,
    );
    domains = yamlDump({
        entities: Array.from(domains.entities),
        intents: Array.from(domains.intents),
        actions: Array.from(domains.actions),
        forms: Array.from(domains.forms),
        templates: domains.templates,
        slots: domains.slots,
    });
    return domains;
};
