import { safeDump as yamlDump } from 'js-yaml';

const trimStart = str => str.replace(/^\s+/, '');
const trimEnd = str => str.replace(/\s+$/, '');

export const extractDomain = storyGroup => {
    let domains = storyGroup.stories.map(story => {
        let val = new StoryValidator(story);
        val.validateStories();
        return val.extractDomain();
    });
    domains = domains.reduce((d1, d2) => ({
        entities: new Set([...d1.entities, ...d2.entities]),
        intents: new Set([...d1.intents, ...d2.intents]),
        actions: new Set([...d1.actions, ...d2.actions]),
        forms: new Set([...d1.forms, ...d2.forms]),
        templates: new Set([...d1.templates, ...d2.templates])
    }));
    domains = yamlDump({
        entities: Array.from(domains.entities),
        intents: Array.from(domains.intents),
        actions: Array.from(domains.actions),
        forms: Array.from(domains.forms),
        templates: Array.from(domains.templates)
    });
    return domains;
}

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
            slots: new Set()
        };
        this.line = 0;
        this.prefix = null;
        this.content = null;
        this.story = null;
        this.intent = null;
        this.form = null;
        this.exceptions = [];
    }

    raiseStoryException = (type, message) => {
        this.exceptions.push(new StoryException(type, this.line, `${message}.`))
    }

    splitPrefix = () => {
        let line = this.stories[this.line];
        try { [this.prefix, this.content] = /(^## |^\* |^ +- )(.*)/.exec(line).slice(1, 3); }
        catch (e) { this.raiseStoryException('error', 'Invalid prefix'); }
        this.prefix = trimStart(this.prefix);
    }

    validateUtter = () => {
        this.form = null;
        this.extracted.actions.add(this.content);
    }

    validateAction = this.validateUtter;

    validateForm = () => {
        this.form = this.content;
        this.extracted.forms.add(this.content);
    }

    validateSlot = () => {
        this.form = null;
        this.extracted.slots.add(this.content);
    }

    validateIntent = () => {
        if (!this.story) this.raiseStoryException('error', 'Intent not part of a story');
        this.intent = this.content.split(' OR ').map(disj => trimStart(disj));
        this.form = null;
        for (let disj of this.intent) {
            let intent, entities;
            try {
                [intent, entities] = /([^{]*) *({.*}|)/.exec(disj).slice(1, 3);
                entities = entities && entities !== '' ? 
                    Object.keys(JSON.parse(entities)) : 
                    [];
            }
            catch (e) { this.raiseStoryException('error', 'Intent could not be parsed'); }
            this.extracted.intents.add(intent);
            entities.forEach(entity => this.extracted.entities.add(entity));
        }
    }

    validateResponse = () => {
        if (!this.story) this.raiseStoryException('error', 'Response not part of a story');
        if (!this.intent) this.raiseStoryException('warning', 'Response not part of an intent');
        this.content = trimEnd(trimStart(this.content));
        if (this.content.match(/^utter_/)) {
            this.validateUtter();
        } else if (this.content.match(/^action_/)) {
            this.validateAction();
        } else if (this.content.match(/_form$/)) {
            this.validateForm();
        } else if (this.content.match(/^slot/)) {
            this.validateSlot();
        } else if (this.content.match(/^form/)) {
            let props;
            try {
                props = JSON.parse(/([^{]*) *({.*}|)/.exec(this.content).slice(2, 3));
            }
            catch (e) { this.raiseStoryException('error', 'Form could not be parsed'); }
            if (!props.hasOwnProperty('name')) raiseStoryException('warning', 'Form has no name property');
            if (this.form && this.form === props.name) {
                this.form = null;
            } else {
                if (!this.form) this.raiseStoryException('warning', 'Form is not preceded by valid form declaration');
            }
        } else {
            this.raiseStoryException('warning', 'Response does not follow naming convention (action, utter, slot, form)');
        }
    }

    validateStories = () => {
        for (this.line; this.line < this.stories.length; this.line++ ) {
            let line = this.stories[this.line];
            if (trimStart(line).length === 0) continue;
            this.splitPrefix();
            if (this.prefix === '## ') { // new story
                this.story = this.content;
                this.intent = null;
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
            throw new Error(`Error! ${errors[0].message} at line ${errors[0].line}.`)
        }
        return {...this.extracted,
                templates: new Set()
        };
    }
}