
import SimpleSchema from 'simpl-schema';

import { validateYaml } from '../../lib/utils';

export const privateSettingsSchema = new SimpleSchema({
    defaultEndpoints: {
        type: String, custom: validateYaml, optional: true, defaultValue: '',
    },
    defaultCredentials: { type: String, custom: validateYaml, optional: true },
    defaultRules: { type: String, custom: validateYaml, optional: true },
    defaultPolicies: { type: String, custom: validateYaml, optional: true },
    reCatpchaSecretServerKey: { type: String, optional: true },
});

export const publicSettingsSchema = new SimpleSchema({
    reCatpchaSiteKey: { type: String, optional: true },
    defaultNLUConfig: {
        type: String, custom: validateYaml, optional: true, defaultValue: '',
    },
    chitChatProjectId: { type: String, optional: true },
    docUrl: { type: String, defaultValue: 'https://docs.botfront.io' },
    backgroundImages: { type: Array, defaultValue: [] },
    'backgroundImages.$': { type: String },
});

export const GlobalSettingsSchema = new SimpleSchema(
    {
        settings: { type: Object },
        'settings.private': { type: privateSettingsSchema, optional: true },
        'settings.public': { type: publicSettingsSchema, optional: true },
        createdAt: {
            type: Date,
            optional: true,
            // autoValue: () => this.isUpdate ? this.value : new Date() //TODO find out why it's always updated
        },
        updatedAt: {
            type: Date,
            optional: true,
            autoValue: () => new Date(),
        },
    },
    { tracker: Tracker },
);
