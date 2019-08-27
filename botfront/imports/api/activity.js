import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import shortid from 'shortid';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

import { formatError, getProjectIdFromModelId } from '../lib/utils';
import ExampleUtils from '../ui/components/utils/ExampleUtils';
import { checkIfCan } from '../lib/scopes';

export const ActivityCollection = new Mongo.Collection('activity');
// Deny all client-side updates on the ActivityCollection collection
ActivityCollection.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

const ActivitySchema = new SimpleSchema({
    _id: String,
    modelId: String,
    text: String,
    intent: { type: String, optional: true },
    entities: Array,
    'entities.$': Object,
    'entities.$.start': Number,
    'entities.$.end': Number,
    'entities.$.value': String,
    'entities.$.entity': String,
    'entities.$.confidence': { type: Number, optional: true },
    'entities.$.extractor': { type: String, optional: true },
    'entities.$.processors': { type: Array, optional: true },
    'entities.$.processors.$': String,
    confidence: { type: Number, optional: true },
    validated: { type: Boolean, optional: true },
    warning: { type: Object, optional: true },
    'warning.title': String,
    'warning.description': String,
    createdAt: {
        type: Date,
        optional: true,
    },
    updatedAt: {
        type: Date,
        autoValue() { return new Date(); },
    },
    ooS: { type: Boolean, defaultValue: false },
});

Meteor.startup(() => {
    if (Meteor.isServer) {
        ActivityCollection._ensureIndex({ modelId: 1, createdAt: 1 });
        ActivityCollection._ensureIndex({ modelId: 1, text: 1 });
    }
});

if (Meteor.isServer) {
    Meteor.publish('activity', function(modelId) { // eslint-disable-line
        check(modelId, String);
        try {
            checkIfCan(['nlu-data:r'], getProjectIdFromModelId(modelId));
            
            return ActivityCollection.find({ modelId });
        } catch (e) {
            return [];
        }
    });
}

ActivityCollection.attachSchema(ActivitySchema);

Meteor.methods({
    'activity.markooS'(modelId, itemId) {
        checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
        check(itemId, String);
        check(modelId, String);
        return ActivityCollection.update(
            { _id: itemId },
            { $set: { ooS: true, validated: false } },
        );
    },

    'activity.deleteExamples'(modelId, itemIds) {
        checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
        check(itemIds, Array);
        check(modelId, String);
        return ActivityCollection.remove({ _id: { $in: itemIds } });
    },

    'activity.onChangeIntent'(examplesIds, intent, modelId) {
        checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
        check(examplesIds, Array);
        check(intent, Match.Maybe(String));
        check(modelId, String);
        let set = { confidence: 0 };
        let unset = {};
        if (intent) set = { ...set, intent };
        else { unset = { intent }; set = { ...set, validated: false }; }
        return ActivityCollection.update(
            { _id: { $in: examplesIds } },
            {
                $set: set,
                $unset: unset,
            }, { multi: true },
        );
    },

    'activity.log'(parseData) {
        check(parseData, Object);
        const utterance = parseData;
        const { modelId, text } = parseData;
        if (utterance.intent_ranking) delete utterance.intent_ranking;
        utterance.confidence = utterance.intent.confidence;
        utterance.intent = utterance.intent.name;
        if (utterance.entities) utterance.entities = utterance.entities.filter(e => e.extractor !== 'ner_duckling_http');
        return ActivityCollection.upsert(
            { modelId, text },
            { $set: { ...utterance, updatedAt: new Date() }, $setOnInsert: { _id: shortid.generate(), createdAt: new Date() } },
        );
    },

    'activity.updateExamples'(examples) {
        check(examples, Array);
        examples.map((example) => {
            const {
                _id,
                modelId,
                ...exampleBody
            } = example;

            checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
            check(modelId, String);
            check(example, Object);

            // unsetProperties are the props that were left out (set to undefined) when editing the utterance
            // TODO maybe set the confidence to 1.0 when manually updating to avoid this?
            const unsetProperties = ExampleUtils.updateableProps().filter(item => exampleBody[item] === undefined);

            const unset = {};
            unsetProperties.forEach((prop) => { unset[prop] = null; });

            return ActivityCollection.update(
                { _id },
                {
                    $set: exampleBody,
                    $unset: unset,
                },
            );
        });
    },

    'activity.addToTraining'(modelId, u) {
        check(modelId, String);
        checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
        check(u, [String]);
        const examples = ActivityCollection.find({ _id: { $in: u } });
        const error = Promise.await(new Promise((resolve) => {
            Meteor.call('nlu.insertExamples', modelId, examples.map(example => ExampleUtils.stripBare(example, true, true)), (err) => {
                if (err) {
                    resolve(err);
                } else {
                    resolve();
                }
            });
        }));
        if (error) throw formatError(error);
        return ActivityCollection.remove({ _id: { $in: u } });
    },

    'activity.addValidatedToTraining'(modelId) {
        check(modelId, String);
        checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));

        const validatedExamples = ActivityCollection.find({ modelId, validated: true, $or: [{ ooS: { $exists: false } }, { ooS: { $eq: false } }] }).fetch();

        const error = Promise.await(new Promise((resolve) => {
            Meteor.call('nlu.insertExamples', modelId, validatedExamples.map(example => ExampleUtils.stripBare(example, true, true)), (err) => {
                if (err) {
                    resolve(err);
                } else {
                    resolve();
                }
            });
        }));

        if (error) {
            const warning = {
                title: 'Error Occurred',
                description: 'An error has occurred inserting these examples into the training data.',
            };

            ActivityCollection.update({ modelId, validated: true }, { $set: { warning, validated: false } }, { multi: true });
            throw formatError(error);
        }

        return ActivityCollection.remove({ modelId, validated: true, $or: [{ ooS: { $exists: false } }, { ooS: { $eq: false } }] });
    },
});
