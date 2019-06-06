import SimpleSchema from 'simpl-schema';

export const InstanceSchema = new SimpleSchema(
    {
        name: { type: String },
        type: { type: Array, optional: true },
        'type.$': { type: String, allowedValues: ['nlu', 'core'] },
        host: { type: String, regEx: /^(http|https):\/\// },
        token: { type: String, optional: true },
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
