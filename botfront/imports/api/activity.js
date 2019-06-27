import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { formatError, getProjectIdFromModelId } from '../lib/utils';
import ExampleUtils from '../ui/components/utils/ExampleUtils';
import { Instances } from './instances/instances.collection';
import { NLUModels } from './nlu_model/nlu_model.collection';
import { parseNlu } from '../lib/nlu_methods';
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
    intent: String,
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
            checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));
            
            return ActivityCollection.find({ modelId });
        } catch (e) {
            return [];
        }
    });

    Meteor.methods({
        'activity.reinterpret'(projectId, modelId, itemIds) {
            checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));
            check(itemIds, Array);
            check(modelId, String);
            check(projectId, String);
    
            try {
                const items = ActivityCollection.find({ _id: { $in: itemIds } }).fetch();
                const model = NLUModels.findOne({ _id: modelId }, { fields: { instance: 1 } });
                if (!model.instance) throw new Meteor.Error('400', 'Model has no instance set.');
                const instance = Instances.findOne({ _id: model.instance });
                this.unblock();
                const results = Promise.await(parseNlu(projectId, modelId, instance, items.map(i => ({ q: i.text })), true));
                return results.map((r) => {
                    // eslint-disable-next-line no-param-reassign
                    r.entities = r.entities.filter(e => e.extractor === 'ner_crf');
                    return ActivityCollection.update({ modelId, text: r.text }, { $set: r });
                });
            } catch (e) {
                throw e;
            }
        },
    });
}

ActivityCollection.attachSchema(ActivitySchema);

Meteor.methods({
    'activity.deleteExamples'(modelId, itemIds) {
        checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));
        check(itemIds, Array);
        check(modelId, String);
        return ActivityCollection.remove({ _id: { $in: itemIds } });
    },

    'activity.onChangeIntent'(examplesIds, intent, modelId) {
        checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));
        check(examplesIds, Array);
        check(intent, String);
        check(modelId, String);
        return ActivityCollection.update(
            { _id: { $in: examplesIds } },
            {
                $set: { intent, confidence: 0 },
            }, { multi: true },
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

            check(modelId, String);
            check(example, Object);
            checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

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

    'activity.addValidatedToTraining'(modelId) {
        check(modelId, String);
        checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

        const validatedExamples = ActivityCollection.find({ modelId, validated: true }).fetch();

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

        return ActivityCollection.remove({ modelId, validated: true });
    },
});
