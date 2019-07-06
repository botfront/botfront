import SimpleSchema from 'simpl-schema';
import { privateSettingsSchema as basePrivateSettingsSchema, publicSettingsSchema as basePublicSettingsSchema } from './globalSettings.schema.default';

export const privateSettingsSchema = basePrivateSettingsSchema.extend({
    gcpModelsBucket: { type: String, optional: true },
    gcpProjectId: { type: String, optional: true },
    bfApiHost: { type: String, optional: true },
    imagesTag: { type: String, optional: true },
    dockerRegistry: { type: String, optional: true },
    defaultDeployment: { type: String, optional: true },
});

export const publicSettingsSchema = basePublicSettingsSchema.extend({
    intercomAppId: { type: String, optional: true },
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
