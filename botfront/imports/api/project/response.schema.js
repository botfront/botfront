import SimpleSchema from 'simpl-schema';
import yaml from 'js-yaml';
import { languages } from '../../lib/languages';

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

export const MatchSchema = new SimpleSchema({
    nlu: { type: Array, optional: true },
    'nlu.$': Object,
    'nlu.$.intent': { type: String, min: 1 },
    'nlu.$.entities': { type: Array, defaultValue: [] },
    'nlu.$.entities.$': { type: Object },
    'nlu.$.entities.$.entity': { type: String, label: 'Entity name' },
    'nlu.$.entities.$.value': {
        type: String,
        label: 'Entity value',
        optional: true,
        min: 1,
    },
});

export const FollowUpSchema = new SimpleSchema({
    action: { type: String, required: false },
    delay: { type: Number, defaultValue: 0, min: 0 },
});

export const TemplateSchema = new SimpleSchema(
    {
        key: {
            type: String,
            label: 'Template Key',
            regEx: /^(utter_)/,
        },
        values: {
            type: Array,
            maxCount: 5,
            minCount: 0,
        },
        match: { type: MatchSchema, optional: true },
        followUp: { type: FollowUpSchema, optional: true },
        'values.$': { type: Object },
        'values.$.lang': {
            type: String,
            allowedValues: Object.keys(languages),
        },
        'values.$.sequence': { type: Array },
        'values.$.sequence.$': { type: Object },
        'values.$.sequence.$.content': { type: String },
    },
    { tracker: Tracker },
);

TemplateSchema.addDocValidator((obj) => {
    const errors = [];
    obj.values.map((v, vi) => v.sequence.forEach((sequence, seqIndex) => {
        try {
            let payload = yaml.safeLoad(sequence.content);
            if (typeof payload === 'string') payload = { text: payload };
            const schemas = [LegacyCarouselSchema, ImageSchema, QuickRepliesSchema, TextSchema, FBMButtonTemplateSchema, FBMGenericTemplateSchema, FBMListTemplateSchema, FBMHandoffTemplateSchema];
            const contexts = schemas.map(s => s.newContext());
            contexts.map(c => c.validate(payload));
            // An array like [0,1,0,0] means it's a QuickRepliesSchema
            const valid = contexts.map(c => (c.isValid() ? 1 : 0));
            // Sum over [0,0,0,0] = 0 means entry not validated against any schema
            const hasError = valid.reduce((a, b) => a + b, 0) === 0;
            if (hasError) {
                contexts.forEach((context) => {
                    if (context.validationErrors()) {
                        context.validationErrors().forEach((e) => {
                            e.name = `values.${vi}.sequence.${seqIndex}.${e.name}`;
                            errors.push(e);
                        });
                    }
                });
            }
        } catch (e) {
            errors.push('unknown');
        }
    }));
    return errors;
});
