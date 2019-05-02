import SimpleSchema from 'simpl-schema';
import { privateSettingsSchema as basePrivateSettingsSchema, publicSettingsSchema as basePublicSettingsSchema } from './globalSettings.schema.default';

export const privateSettingsSchema = basePrivateSettingsSchema.extend({
    bfApiHost: { type: String, optional: true },
});

export const GlobalSettingsSchema = new SimpleSchema(
    {
        settings: { type: Object },
        'settings.private': { type: privateSettingsSchema, optional: true },
        'settings.public': { type: basePublicSettingsSchema, optional: true },
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
