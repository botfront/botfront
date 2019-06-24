import SimpleSchema from 'simpl-schema';

function validateMinMaxValue() {
    if (this.field('minValue').value >= this.field('maxValue').value && this.field('type').value === 'float') {
        return 'minMax';
    }
    return true;
}

export const SlotSchema = new SimpleSchema({
    name: String,
    projectId: String,
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

export const slotSchemas = {
    Boolean: new SimpleSchema({
        initialValue: { type: Boolean, defaultValue: false },
    }).extend(SlotSchema),

    Categorical: new SimpleSchema({
        initialValue: { type: String, defaultValue: null, optional: true },
        categories: { type: Array, minCount: 1 },
        'categories.$': { type: String },
    }).extend(SlotSchema),

    Float: new SimpleSchema({
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

    List: new SimpleSchema({
        initialValue: {
            blackbox: true, defaultValue: null, optional: true, type: Object,
        },
    }).extend(SlotSchema),

    Text: new SimpleSchema({
        initialValue: { type: String, defaultValue: false },
    }).extend(SlotSchema),

    Unfeaturized: new SimpleSchema({
        initialValue: {
            blackbox: true, defaultValue: null, optional: true, type: Object,
        },
    }).extend(SlotSchema),
};

slotSchemas.Categorical.messageBox.messages({
    en: {
        minMax: 'Maximum value must be greater than minimum value',
    },
});
