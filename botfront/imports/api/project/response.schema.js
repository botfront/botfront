import SimpleSchema from 'simpl-schema';

const sequenceSchema = new SimpleSchema({
    metadata: { type: Object, blackbox: true, optional: true },
});

export const ImageSchema = new SimpleSchema(
    {
        text: String,
        image: String,
    },
    { tracker: Tracker },
).extend(sequenceSchema);

export const QuickRepliesSchema = new SimpleSchema(
    {
        text: String,
        buttons: { type: Array, minCount: 1 },
        'buttons.$': Object,
        'buttons.$.title': String,
        'buttons.$.image_url': { type: String, required: false },
        'buttons.$.payload': String,
        'buttons.$.type': {
            type: String,
            required: false,
            allowedValues: ['postback', 'web_url'],
            defaultValue: 'postback',
        },
    },
    { tracker: Tracker },
).extend(sequenceSchema);

export const TextSchema = new SimpleSchema(
    {
        text: String,
    },
    { tracker: Tracker },
).extend(sequenceSchema);

export const ButtonSchema = new SimpleSchema(
    {
        title: String,
        type: { type: String, allowedValues: ['postback', 'web_url'] },
        payload: { type: String, required: false },
        url: { type: String, required: false },
    },
    { tracker: Tracker },
);

export const FBMElementSchema = new SimpleSchema(
    {
        title: String,
        image_url: { type: String, optional: true },
        subtitle: { type: String, optional: true },
        buttons: {
            type: Array,
            minCount: 1,
            maxCount: 3,
            optional: true,
        },
        'buttons.$': ButtonSchema,
        default_action: { type: Object, required: false },
        'default_action.type': { type: String, allowedValues: ['web_url', 'postback'] },
        'default_action.url': { type: String, required: false },
        'default_action.postback': { type: String, required: false },
        'default_action.messenger_extensions': { type: Boolean, defaultValue: false, required: false },
        'default_action.webview_height_ratio': { type: String, allowedValues: ['compact', 'tall', 'full'] },
    },
    { tracker: Tracker },
);

export const FBMListTemplateSchema = new SimpleSchema(
    {
        template_type: { type: String, allowedValues: ['list'] },
        top_element_style: { type: String, allowedValues: ['large', 'compact'], required: false },
        elements: Array,
        'elements.$': FBMElementSchema,
    },
    { tracker: Tracker },
).extend(sequenceSchema);

export const FBMHandoffTemplateSchema = new SimpleSchema(
    {
        template_type: { type: String, allowedValues: ['handoff'] },
        expire_after: { type: Number, defaultValue: 300 },
    },
    { tracker: Tracker },
).extend(sequenceSchema);

export const FBMGenericTemplateSchema = new SimpleSchema(
    {
        template_type: { type: String, allowedValues: ['generic'] },
        elements: Array,
        'elements.$': FBMElementSchema,
    },
    { tracker: Tracker },
).extend(sequenceSchema);

export const FBMButtonTemplateSchema = new SimpleSchema(
    {
        template_type: { type: String, allowedValues: ['button'] },
        text: { type: String },
        buttons: { type: Array, minCount: 1 },
        'buttons.$': ButtonSchema,
    },
    { tracker: Tracker },
).extend(sequenceSchema);

export const LegacyCarouselSchema = new SimpleSchema(
    {
        text: { type: String, optional: true },
        elements: { type: Array, maxCount: 10, minCount: 1 },
        'elements.$': FBMElementSchema,
    },
    { tracker: Tracker },
).extend(sequenceSchema);
