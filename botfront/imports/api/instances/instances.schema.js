import SimpleSchema from 'simpl-schema';

export const InstanceSchema = new SimpleSchema(
    {
        name: { type: String },
        type: { type: Array, minCount: 1 },
        'type.$': { type: String, allowedValues: ['nlu', 'core'] },
        host: { type: String, regEx: /^(http|https):\/\// },
        token: { type: String, optional: true },
        adminOnly: { type: Boolean, defaultValue: false },
        projectId: { type: String },
    },
    {
        clean: {
            filter: true,
            autoConvert: true,
            removeEmptyStrings: true,
            trimStrings: true,
            getAutoValues: true,
            removeNullsFromArrays: true,
        },
    },
);
