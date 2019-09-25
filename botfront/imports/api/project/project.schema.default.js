import SimpleSchema from 'simpl-schema';
import { TemplateSchema } from './response.schema';
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
    // apiKey: { type: String, optional: true },
    // namespace: {
    //     type: String, regEx: /^[a-z0-9-_]+$/, unique: 1, sparse: 1,
    // },
    defaultLanguage: { type: String, optional: true },
    createdAt: { type: Date, optional: true },
    disabled: { type: Boolean, defaultValue: false, index: 1 },
    nlu_models: { type: Array, defaultValue: [] },
    'nlu_models.$': { type: String },
    templates: { type: Array, defaultValue: [] },
    'templates.$': { type: TemplateSchema },
    responsesUpdatedAt: { type: SimpleSchema.Integer, optional: true },
    updatedAt: {
        type: Date,
        optional: true,
        autoValue: () => new Date(),
        index: -1,
    },
    instance: { type: String, optional: true },
    training: { type: Object, optional: true },
    'training.status': { type: String, allowedValues: ['training', 'success', 'failure'] },
    'training.startTime': { type: Date, optional: true },
    'training.endTime': { type: Date, optional: true },
    'training.message': { type: String, optional: true },
    defaultDomain: { type: DefaultDomainSchema, optional: true },
}, { tracker: Tracker });

ProjectsSchema.messageBox.messages({
    en: {
        name: 'The name can only contain alphanumeric characters',
    },
});

ProjectsSchema.messageBox.messages({
    en: {
        duplicateTemplate: 'Template keys must be unique',
    },
});
