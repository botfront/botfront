import SimpleSchema from 'simpl-schema';

function validateMinMaxValue() {
    if (
        this.field('minValue').value >= this.field('maxValue').value
        && this.field('category').value === 'float'
    ) {
        return 'minMax';
    }
    return true;
}

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
            custom: validateMinMaxValue,
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

SlotsSchema.messageBox.messages({
    en: {
        minMax: 'Maximum value must be greater than minimum value',
    },
});
