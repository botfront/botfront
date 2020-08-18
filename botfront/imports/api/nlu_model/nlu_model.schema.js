import SimpleSchema from 'simpl-schema';
import { uuidv4 } from 'uuid/v4';
import { languages } from '../../lib/languages';

export const TrainingExampleSchema = new SimpleSchema({
    _id: { type: String },
    text: {
        type: String,
        custom() { // eslint-disable-line
            if (this.value === '') {
                return 'EmptyString';
            }
        },
    },
    canonical: { type: Boolean, optional: true },
    intent: String,
    entities: { type: Array, optional: true },
    'entities.$': Object,
    'entities.$.start': SimpleSchema.Integer,
    'entities.$.end': SimpleSchema.Integer,
    'entities.$.entity': String,
    'entities.$.value': String,
    updatedAt: {
        type: Date,
        optional: true,
        // eslint-disable-next-line consistent-return
        autoValue() {
            if (!this.isSet && this.operator !== '$pull') { // this check here is necessary!
                return new Date();
            }
        },
    },
});

export const TrainingDataSchema = new SimpleSchema({
    common_examples: { type: Array, defaultValue: [], optional: true },

    'common_examples.$': TrainingExampleSchema,

    entity_synonyms: { type: Array, defaultValue: [] },
    'entity_synonyms.$': Object,
    'entity_synonyms.$._id': { type: String },
    'entity_synonyms.$.value': { type: String, regEx: /.*\S.*/ },
    'entity_synonyms.$.synonyms': { type: Array, minCount: 1 },
    'entity_synonyms.$.synonyms.$': { type: String, regEx: /.*\S.*/ },
    fuzzy_gazette: { type: Array, defaultValue: [], optional: true },
    'fuzzy_gazette.$': Object,
    'fuzzy_gazette.$._id': { type: String },
    'fuzzy_gazette.$.value': { type: String, regEx: /.*\S.*/ }, // TODO: make value unique
    'fuzzy_gazette.$.gazette': { type: Array, minCount: 1 },
    'fuzzy_gazette.$.gazette.$': {
        type: String,
        custom() { // eslint-disable-line
            if (this.value === '') {
                return 'EmptyString';
            }
        },
    },
    'fuzzy_gazette.$.mode': {
        type: String,
        allowedValues: ['ratio', 'partial_ratio', 'token_sort_ratio', 'token_set_ratio'],
        defaultValue: 'ratio',
    },
    'fuzzy_gazette.$.min_score': {
        type: SimpleSchema.Integer,
        defaultValue: 80,
        custom() { // eslint-disable-line
            if (this.value < 0 || this.value > 100) {
                return 'OutOfRange';
            }
        },
    },
    regex_features: { type: Array, defaultValue: [] },
    'regex_features.$': Object,
    'regex_features.$._id': { type: String, autoValue: () => uuidv4() },
    'regex_features.$.name': { type: String, regEx: /.*\S.*/ },
    'regex_features.$.pattern': String,
});
export const NLUModelSchema = new SimpleSchema({
    name: { type: String, optional: true },
    language: {
        type: String,
        // TODO: make a lighter languages document
        allowedValues: Object.keys(languages),
    },
    description: { type: String, optional: true },
    config: { type: String, optional: true },

    evaluations: { type: Array, optional: true, defaultValue: [] },
    'evaluations.$': { type: String },

    intents: { type: Array, defaultValue: [] },
    'intents.$': { type: Object },
    'intents.$.name': { type: String },

    chitchat_intents: { type: Array, defaultValue: [] },
    'chitchat_intents.$': { type: String },
    training_data: {
        type: TrainingDataSchema,
        defaultValue: {
            common_examples: [],
            entity_synonyms: [],
            regex_features: [],
        },
    },


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

}, { tracker: Tracker });
