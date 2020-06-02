
import SimpleSchema from 'simpl-schema';
import { languages } from '../../lib/languages';

import { ENVIRONMENT_OPTIONS } from '../../ui/components/constants.json';
import { validateYaml } from '../../lib/utils';

export const DefaultDomainSchema = new SimpleSchema({
    content: {
        type: String,
        custom: validateYaml,
    },
});

export const logosSchema = new SimpleSchema({
    smallLogoUrl: { type: String, optional: true },
    logoUrl: { type: String, optional: true },
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
    nluThreshold: {
        type: Number, defaultValue: 0.75, min: 0.5, max: 0.95,
    },
    timezoneOffset: {
        type: Number, defaultValue: 0, min: -22, max: 22,
    },
    defaultLanguage: { type: String, allowedValues: Object.keys(languages) },
    createdAt: { type: Date, optional: true },
    disabled: { type: Boolean, defaultValue: false, index: 1 },
    nlu_models: { type: Array, defaultValue: [] },
    'nlu_models.$': { type: String },
    responsesUpdatedAt: { type: SimpleSchema.Integer, optional: true },
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
    deploymentEnvironments: {
        type: Array,
        defaultValue: [],
    },
    'deploymentEnvironments.$': {
        type: String,
        allowedValues: ENVIRONMENT_OPTIONS.slice(1),
    },

    defaultDomain: { type: DefaultDomainSchema, optional: true },
    storyGroups: { type: Array, defaultValue: [] },
    'storyGroups.$': { type: String },
    logoUrl: { type: String, optional: true },
    smallLogoUrl: { type: String, optional: true },
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
