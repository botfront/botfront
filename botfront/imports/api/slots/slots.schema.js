import SimpleSchema from 'simpl-schema';

export const SlotsSchema = new SimpleSchema(
    {
        _id: { type: String, optional: true },
        name: {
            type: String,
        },
        projectId: { type: String },
        category: {
            type: String,
            allowedValues: [
                'text',
                'bool',
                'categorical',
                'float',
                'list',
                'unfeaturized',
            ],
        },
        // categories: {
        //     optional: true,
        //     type: Array,
        // },
        // 'categories.$': {
        //     type: String,
        // },
        createdAt: {
            type: Date,
            optional: true,
        },
        updatedAt: {
            type: Date,
            optional: true,
            autoValue: () => new Date(),
        },
        minValue: {
            type: Number,
            optional: true,
        },
        maxValue: {
            type: Number,
            optional: true,
        },
        initialValue: {
            type: String,
            optional: true,
        },
    },

    {
        clean: {
            filter: false,
        },
    },
);
