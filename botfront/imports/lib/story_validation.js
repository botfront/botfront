import { safeDump as yamlDump } from 'js-yaml';

const trimStart = str => str.replace(/^\s+/, '');
const trimEnd = str => str.replace(/\s+$/, '');

class StoryException {
    constructor(type, line, message) {
        this.type = type;
        this.line = line;
        this.message = message;
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
    }

    raiseStoryException = (type, message) => {
        this.exceptions.push(new StoryException(type, this.line + 1, `${message}.`));
    }

    validateUtter = () => {
        this.form = null;
        this.checkForInvalidChars(this.response);
        this.extracted.actions.add(this.response);
    }

    validateAction = this.validateUtter;

    validateForm = () => {
        this.form = this.response;
        this.checkForInvalidChars(this.response);
        this.extracted.forms.add(this.response);
    }

    validateSlot = () => {

    }

    validateIntent = () => {
        if (!this.story) this.raiseStoryException('error', 'Intent not part of a story');
        if (this.intent && !this.response) this.raiseStoryException('warning', 'Previous intent empty');
        this.intent = this.content.split(' OR ').map(disj => trimStart(disj));
        this.response = null;
        this.form = null;
        this.intent.forEach((disj) => {
            try {
                let [intent, entities] = /([^{]*) *({.*}|)/.exec(disj).slice(1, 3);
                entities = entities && entities !== ''
                    ? Object.keys(JSON.parse(entities))
                    : [];
                this.checkForInvalidChars(intent);
                this.extracted.intents.add(intent);
                entities.forEach(entity => this.extracted.entities.add(entity));
            } catch (e) {
                this.raiseStoryException('error', 'Intent could not be parsed');
            }
        });
    }

    validateResponse = () => {
        if (!this.story) this.raiseStoryException('error', 'Response not part of a story');
        if (this.story && !this.intent) this.raiseStoryException('warning', 'Response not part of an intent');
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
                this.raiseStoryException('error', 'Form could not be parsed');
            }
            if (!props.hasOwnProperty('name')) this.raiseStoryException('warning', 'Form has no name property');
            if (this.form === props.name) {
                this.form = null;
            } else if (!this.form) {
                this.raiseStoryException('warning', 'Form is not preceded by valid form declaration');
            }
        } else {
            this.raiseStoryException('warning', 'Response does not follow naming convention (action, utter, slot, form)');
        }
    }

    validateStories = () => {
        for (this.line; this.line < this.stories.length; this.line += 1) {
            const line = this.stories[this.line];
            if (trimStart(line).length === 0) continue;
            try {
                [this.prefix, this.content] = /(^ *## |^ *\* |^ *- )(.*)/.exec(line).slice(1, 3);
                this.prefix = trimStart(this.prefix);
            } catch (e) {
                this.raiseStoryException('error', 'Invalid prefix');
                continue;
            }
            if (this.prefix === '## ') { // new story
                if (this.story && !this.intent && !this.response) this.raiseStoryException('warning', 'Previous story empty');
                if (this.story && this.intent && !this.response) this.raiseStoryException('warning', 'Previous intent empty');
                this.story = this.content;
                this.intent = null;
                this.response = null;
                this.form = null;
                continue;
            } else if (this.prefix === '* ') { // new intent
                this.validateIntent();
            } else if (this.prefix === '- ') { // new response)
                this.validateResponse();
            }
        }
    }

    extractDomain = () => {
        const errors = this.exceptions.filter(exception => exception.type === 'error');
        if (errors.length > 0) {
            throw new Error(`Error! ${errors[0].message} at line ${errors[0].line}.`);
        }
        return {
            ...this.extracted,
            templates: new Set(),
        };
    }
}

export const extractDomain = (storyGroup) => {
    let domains = storyGroup.stories.map((story) => {
        const val = new StoryValidator(story);
        val.validateStories();
        return val.extractDomain();
    });
    domains = domains.reduce((d1, d2) => ({
        entities: new Set([...d1.entities, ...d2.entities]),
        intents: new Set([...d1.intents, ...d2.intents]),
        actions: new Set([...d1.actions, ...d2.actions]),
        forms: new Set([...d1.forms, ...d2.forms]),
        templates: new Set([...d1.templates, ...d2.templates]),
    }));
    domains = yamlDump({
        entities: Array.from(domains.entities),
        intents: Array.from(domains.intents),
        actions: Array.from(domains.actions),
        forms: Array.from(domains.forms),
        templates: Array.from(domains.templates),
    });
    return domains;
};
