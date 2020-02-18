import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

import { checkIfCan } from '../lib/scopes';
import { getProjectIdFromModelId } from '../lib/utils';

export const Evaluations = new Mongo.Collection('nlu_evaluations');
// Deny all client-side updates on the Instances collection
Evaluations.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

export const EvaluationSchema = new SimpleSchema({
    modelId: String,
    timestamp: {
        type: Date,
        autoValue: () => { if (!this.isSet) return new Date(); },
    },
    results: { type: Object, blackbox: true },
});

if (Meteor.isServer) {
    Evaluations._ensureIndex({ modelId: 1 });
    Meteor.publish('nlu_evaluations', function(modelId) { // eslint-disable-line
        try {
            checkIfCan('nlu-data:r', getProjectIdFromModelId(modelId));
        } catch (e) {
            return [];
        }
        check(modelId, String);
        return Evaluations.find({ modelId });
    });
}

Evaluations.attachSchema(EvaluationSchema);
