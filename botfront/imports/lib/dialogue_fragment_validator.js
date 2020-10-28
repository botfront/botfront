import { safeLoad, safeDump } from 'js-yaml';

const INTENT_KEYS = ['intent', 'entities', 'user'];

export class DialogueFragmentValidator {
    constructor({
        mode = 'story', // story, rule_steps, rule_condition
    } = {}) {
        this.mode = mode;
        this.annotations = [];
    }

    static ensureFragmentIsYamlList = (yaml) => {
        if (!yaml) return [true];
        let value = [];

        try {
            value = safeLoad(yaml);
        } catch (e) {
            let {
                mark: { line },
            } = e;
            const uptoErrorLine = yaml.split('\n').slice(0, line);
            try {
                if (!Array.isArray(safeLoad(uptoErrorLine.join('\n')))) {
                    throw new Error();
                }
                return [false, line];
            } catch {
                line = uptoErrorLine.findIndex(l => l.trim() && !l.trim().match(/^#/));
                return [false, line];
            }
        }

        try {
            const els = yaml
                .split(/^-/m)
                .map(text => text.replace(/^ {1,2}/gm, ''))
                .map(safeLoad)
                .slice(1);
            if (!Array.isArray(value) || value.length !== els.length) throw new Error();
        } catch {
            const row = yaml
                .split('\n')
                .findIndex(l => l.trim() && !l.trim().match(/^#/));
            return [false, row];
        }

        return [true];
    };

    static generateAnnotation = (row, text = '', type = 'error') => ({
        row,
        type,
        text,
    });

    addAnnotation = (row, text = '', type = 'error') => this.annotations.push(
        DialogueFragmentValidator.generateAnnotation(row, text, type),
    );

    validateEntityOrSlotList = (list, index, message) => {
        if (!Array.isArray(list)) {
            this.addAnnotation(index, message);
            return; // fatal
        }
        list.forEach((element, subindex) => {
            const actualIndex = index + 1 + subindex;
            if (!element
                || typeof element !== 'object'
                || Array.isArray(element)
                || Object.keys(element).length !== 1
            ) {
                this.addAnnotation(actualIndex, message);
            }
        });
    }

    validateIntentStep = (step, index) => {
        if (this.mode === 'rule_condition') {
            this.addAnnotation(index, 'Intent step not supported in rule condition');
            return;
        }
        const unsupportedKeys = Object.keys(step).filter(k => !INTENT_KEYS.includes(k));
        unsupportedKeys.forEach((k) => {
            const subindex = safeDump(step).split('\n').findIndex(l => l.match(new RegExp(`^${k}: `)));
            this.addAnnotation(
                index + subindex,
                `Key '${k}' not supported for intent step`,
            );
        });
        const entities = Object.keys(step).findIndex(k => k === 'entities');
        if (entities > -1) this.validateEntityOrSlotList(step.entities, index + entities, 'Entities should be key-value pairs');
    };

    validateOrStep = (step, index) => {
        if (this.mode === 'rule_condition') {
            this.addAnnotation(index, 'Intent disjunction step not supported in rule condition');
            return;
        }
        const value = Object.values(step)[0];
        if (Object.keys(step).length !== 1) {
            this.addAnnotation(
                index,
                'Additional keys not supported for disjunction step',
            );
        }
        if (!Array.isArray(value)) {
            this.addAnnotation(index, 'Disjunction step should be a list of intent steps');
            return; // fatal
        }
        value.forEach((substep, subindex) => {
            const actualIndex = value.slice(0, subindex).reduce(
                (acc, curr) => acc + Object.keys(curr).length, index + 1,
            );
            if (!substep || typeof substep !== 'object' || Array.isArray(step)) {
                this.addAnnotation(actualIndex, 'Disjunction step should be a list of intent steps');
                return; // fatal
            }
            this.validateIntentStep(substep, actualIndex);
        });
    };

    validateActiveLoopStep = (step, index) => {
        const value = Object.values(step)[0];
        if (Object.keys(step).length !== 1) {
            this.addAnnotation(
                index,
                'Additional keys not supported for active_loop step',
            );
        }
        if (typeof value !== 'string' && value !== null) {
            this.addAnnotation(index, 'Active_loop should be null or a string');
        }
    };

    validateActionStep = (step, index) => {
        if (this.mode === 'rule_condition') {
            this.addAnnotation(index, 'Action step not supported in rule condition');
            return;
        }
        const value = Object.values(step)[0];
        if (Object.keys(step).length !== 1) {
            this.addAnnotation(index, 'Additional keys not supported for action step');
        }
        if (typeof value !== 'string') {
            this.addAnnotation(index, 'Action should be a string');
        }
    };

    validateSlotWasSetStep = (step, index) => {
        const value = Object.values(step)[0];
        if (Object.keys(step).length !== 1) {
            this.addAnnotation(
                index,
                'Additional keys not supported for slot_was_set step',
            );
        }
        this.validateEntityOrSlotList(value, index, 'Slot_was_set step should be a list of slot-value pairs');
    };

    incrementAndCheckIntentLineCount = (index) => {
        this.intent_line_count += 1;
        if (this.mode === 'rule_steps' && this.intent_line_count > 1) {
            this.addAnnotation(index, 'Rules support at most one intent step');
            return true;
        }
        return false;
    }

    validateStep = (step, index) => {
        if (!step || typeof step !== 'object' || Array.isArray(step)) {
            if (step === '...' && this.mode === 'rule_steps') return; // exception to rule
            this.addAnnotation(index, 'Step not parsable');
            return; // fatal
        }
        if (Object.keys(step).includes('intent')) {
            if (this.incrementAndCheckIntentLineCount(index)) return;
            this.validateIntentStep(step, index);
        } else if (Object.keys(step).includes('or')) {
            if (this.incrementAndCheckIntentLineCount(index)) return;
            this.validateOrStep(step, index);
        } else if (Object.keys(step).includes('active_loop')) {
            this.validateActiveLoopStep(step, index);
        } else if (Object.keys(step).includes('action')) {
            this.validateActionStep(step, index);
        } else if (Object.keys(step).includes('slot_was_set')) {
            this.validateSlotWasSetStep(step, index);
        } else {
            this.addAnnotation(index, 'Step type not supported');
        }
    };

    validateYamlFragment = (yaml = '') => {
        this.annotations = [];
        if (!yaml) return this.annotations;
        this.intent_line_count = 0;
        const [isValidList, row] = DialogueFragmentValidator.ensureFragmentIsYamlList(
            yaml,
        );
        if (!isValidList) {
            this.addAnnotation(row, 'Invalid YAML');
            return this.annotations; // fatal
        }
        const steps = safeLoad(yaml);
        const stepStartLines = yaml
            .split('\n')
            .reduce((acc, curr, i) => [...acc, ...(curr.match(/^-/) ? [i] : [])], []);

        steps.forEach((step, index) => this.validateStep(step, stepStartLines[index]));
        return this.annotations;
    };
}
