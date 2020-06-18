
import SimpleSchema from 'simpl-schema';
import { languages } from '../../lib/languages';
import { validateYaml } from '../../lib/utils';

export const DefaultDomainSchema = new SimpleSchema({
    content: {
        type: String,
        custom: validateYaml,
    },
});

export const ProjectsSchema = new SimpleSchema({
    name: {
        type: String,
        index: 1,
        custom() {
            return !this.value.match(/^[A-Za-z0-9 ]+$/) ? 'name' : null;
        },
    },
    defaultLanguage: { type: String, allowedValues: Object.keys(languages) },
    createdAt: { type: Date, optional: true },
    disabled: { type: Boolean, defaultValue: false, index: 1 },
    nlu_models: { type: Array, defaultValue: [] },
    'nlu_models.$': { type: String },
    updatedAt: {
        type: Date,
        optional: true,
        autoValue: () => new Date(),
        index: -1,
    },
    training: { type: Object, optional: true },
    'training.status': { type: String, allowedValues: ['training', 'success', 'failure'] },
    'training.startTime': { type: Date, optional: true },
    'training.endTime': { type: Date, optional: true },
    'training.message': { type: String, optional: true },
    defaultDomain: { type: DefaultDomainSchema, optional: true },
    storyGroups: { type: Array, defaultValue: [] },
    'storyGroups.$': { type: String },
}, { tracker: Tracker });

ProjectsSchema.messageBox.messages({
    en: {
        name: 'The name can only contain alphanumeric characters',
    },
});
