import SimpleSchema from 'simpl-schema';

function validateMinMaxValue() {
    if (
        this.field('minValue').value >= this.field('maxValue').value
        && this.field('type').value === 'float'
    ) {
        return 'minMax';
    }
    return true;
}

export const SlotSchema = new SimpleSchema({
    _id: { type: String, optional: true },
    name: String,
    projectId: String,
    type: {
        type: String,
        allowedValues: [
            'text',
            'bool',
            'categorical',
            'float',
            'list',
            'unfeaturized',
            'any',
        ],
    },
    createdAt: {
        type: Date,
        optional: true,
    },
    updatedAt: {
        type: Date,
        optional: true,
        autoValue: () => new Date(),
    },
});

const slotSchemas = {
    bool: new SimpleSchema({
        initialValue: { type: Boolean, defaultValue: false, optional: true },
    }).extend(SlotSchema),

    categorical: new SimpleSchema({
        initialValue: { type: String, defaultValue: null, optional: true },
        categories: { type: Array, minCount: 1 },
        'categories.$': { type: String },
    }).extend(SlotSchema),

    float: new SimpleSchema({
        initialValue: { type: Number, defaultValue: null, optional: true },
        minValue: {
            type: Number,
            optional: true,
        },
        maxValue: {
            type: Number,
            optional: true,
            custom: validateMinMaxValue,
        },
    }).extend(SlotSchema),

    list: new SimpleSchema({
        initialValue: {
            blackbox: true,
            defaultValue: null,
            optional: true,
            type: Object,
        },
    }).extend(SlotSchema),

    text: new SimpleSchema({
        initialValue: { type: String, defaultValue: null, optional: true },
    }).extend(SlotSchema),

    unfeaturized: new SimpleSchema({
        initialValue: SimpleSchema.oneOf(
            { type: String, defaultValue: null, optional: true },
            { type: Boolean, defaultValue: false, optional: true },
            { type: Number, defaultValue: null, optional: true },
            {
                type: Object,
                defaultValue: null,
                optional: true,
                blackbox: true,
            },
        ),
    }).extend(SlotSchema),
};

slotSchemas.any = slotSchemas.unfeaturized;

slotSchemas.float.messageBox.messages({
    en: {
        minMax: 'Maximum value must be greater than minimum value',
    },
});

export { slotSchemas };
