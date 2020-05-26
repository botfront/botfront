
import SimpleSchema from 'simpl-schema';

import { validateYaml } from '../../lib/utils';

const webhookSchema = new SimpleSchema({
    name: { type: String },
    url: { type: String, optional: true },
    method: { type: String },
});

const webhooksSchema = new SimpleSchema({
    restartRasaWebhook: { type: webhookSchema },
    uploadImageWebhook: { type: webhookSchema },
    deleteImageWebhook: { type: webhookSchema },
    deploymentWebhook: { type: webhookSchema },
});

export const privateSettingsSchema = new SimpleSchema({
    defaultEndpoints: {
        type: String, custom: validateYaml, optional: true, defaultValue: '',
    },
    defaultCredentials: { type: String, custom: validateYaml, optional: true },
    defaultRules: { type: String, custom: validateYaml, optional: true },
    defaultPolicies: { type: String, custom: validateYaml, optional: true },
    defaultDefaultDomain: { type: String, optional: true, custom: validateYaml },
    webhooks: { type: webhooksSchema },
    reCatpchaSecretServerKey: { type: String, optional: true },
});

export const publicSettingsSchema = new SimpleSchema({
    reCatpchaSiteKey: { type: String, optional: true },
    defaultNLUConfig: {
        type: String, custom: validateYaml, optional: true, defaultValue: '',
    },
    chitChatProjectId: { type: String, optional: true },
    docUrl: { type: String, defaultValue: 'https://botfront.io/docs' },
    backgroundImages: { type: Array, defaultValue: [] },
    'backgroundImages.$': { type: String },
    logoUrl: { type: String, optional: true },
    smallLogoUrl: { type: String, optional: true },
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
