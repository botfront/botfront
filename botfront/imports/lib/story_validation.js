import { safeDump as yamlDump } from 'js-yaml';

const trimStart = str => str.replace(/^\s+/, '');
const trimEnd = str => str.replace(/\s+$/, '');

class StoryException {
    constructor(type, message, line, code) {
        this.type = type;
        this.line = line;
        this.message = message;
        this.code = code;
    }
}

export class StoryValidator {
    constructor(story) {
        this.stories = story.split('\n');
        this.extracted = {
            entities: new Set(),
            intents: new Set(),
            actions: new Set(),
            forms: new Set(),
            templates: {},
        };
        this.line = 0;
        this.prefix = null;
        this.content = null;
        this.story = null;
        this.intent = null;
        this.response = null;
        this.form = null;
        this.exceptions = [];
    }

    checkForInvalidChars = (str) => {
        if (str.match(/[ /]/)) this.raiseStoryException('error', 'Found invalid character');
    };

    raiseStoryException = (code) => {
        this.exceptions.push(new StoryException(...this.exceptionMessages[code], this.line + 1, code));
    };

    validateUtter = () => {
        this.form = null;
        this.checkForInvalidChars(this.response);
        this.extracted.actions.add(this.response);
        this.extracted.templates[this.response] = '';
    };

    validateAction = () => {
        this.form = null;
        this.checkForInvalidChars(this.response);
        this.extracted.actions.add(this.response);
    };

    validateForm = () => {
        this.form = this.response;
        this.checkForInvalidChars(this.response);
        this.extracted.forms.add(this.response);
    };

    validateSlot = () => {};

    exceptionMessages = {
        prefix: ['error', 'Lines should start with `* ` or `- `'],
        intent: ['error', 'User utterances (intents) should look like this: `* MyIntent` or `* MyIntent{"entity": "value"}`'],
        form: ['error', 'Form calls should look like this: `- form{"name": "MyForm"}`'],
        have_intent: ['warning', 'Bot actions should usually be found in a user utterance (intent) block.'],
        empty_story: ['warning', 'Story closed without defining any interactions.'],
        empty_intent: ['warning', 'User utterance (intent) block closed without defining any bot action.'],
        action_name: ['warning', 'Actions should look like this: `- action_...`, `- utter_...`, `- slot{...}` or `- form{...}`.'],
        declare_form: ['warning', 'Form calls (`- form{"name": "MyForm"}`) should be preceded by matching `- MyForm`.'],
    };

    validateIntent = () => {
        if (this.intent && !this.response) this.raiseStoryException('empty_intent');
        this.intent = this.content.split(' OR ').map(disj => trimStart(disj));
        this.response = null;
        this.form = null;
        this.intent.forEach((disj) => {
            try {
                const intent = /([^{]*) *({.*}|)/.exec(disj)[1];
                let entities = /([^{]*) *({.*}|)/.exec(disj)[2];
                entities = entities && entities !== '' ? Object.keys(JSON.parse(entities)) : [];
                this.checkForInvalidChars(intent);
                this.extracted.intents.add(intent);
                entities.forEach(entity => this.extracted.entities.add(entity));
            } catch (e) {
                this.raiseStoryException('intent');
            }
        });
    };

    validateResponse = () => {
        if (!this.intent) this.raiseStoryException('have_intent');
        this.response = trimEnd(trimStart(this.content));
        if (this.response.match(/^utter_/)) {
            this.validateUtter();
        } else if (this.response.match(/^action_/)) {
            this.validateAction();
        } else if (this.response.match(/_form$/)) {
            this.validateForm();
        } else if (this.response.match(/^slot *{/)) {
            this.validateSlot();
        } else if (this.response.match(/^form *{/)) {
            let props;
            try {
                props = JSON.parse(/([^{]*) *({.*}|)/.exec(this.response).slice(2, 3));
            } catch (e) {
                this.raiseStoryException('form');
            }
            if (!{}.hasOwnProperty.call(props, 'name')) {
                this.raiseStoryException('form');
            } else if (this.form === props.name) {
                this.form = null;
            } else {
                this.raiseStoryException('declare_form');
            }
        } else {
            this.raiseStoryException('action_name');
        }
    };

    validateStories = () => {
        for (this.line; this.line < this.stories.length; this.line += 1) {
            const line = this.stories[this.line].replace(/ *<!--.*--> */g, '');
            if (trimStart(line).length !== 0) {
                try {
                    [this.prefix, this.content] = /(^ *\* |^ *- )(.*)/.exec(line).slice(1, 3);
                    this.prefix = trimStart(this.prefix);
                    if (this.prefix === '* ') {
                        // new intent
                        this.validateIntent();
                    } else if (this.prefix === '- ') {
                        // new response
                        this.validateResponse();
                    }
                } catch (e) {
                    this.raiseStoryException('prefix');
                }
            }
        }
    };

    extractDomain = () => {
        const errors = this.exceptions.filter(exception => exception.type === 'error');
        if (errors.length > 0) {
            throw new Error(`Error at line ${errors[0].line}: ${errors[0].message}`);
        }
        return {
            ...this.extracted,
            slots: {},
        };
    };

    extractDialogAct = () => {
        const initRegex = /^\* *(.*)/;
        const initPayload = initRegex.exec(this.stories[0])[1];
        this.payloads = initPayload.split(' OR ').map(disj => trimStart(disj));
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
        const val = new StoryValidator(story);
        val.validateStories();
        return val.extractDomain();
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
