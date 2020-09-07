import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

import { checkIfCan } from '../lib/scopes';

export const Evaluations = new Mongo.Collection('nlu_evaluations');
// Deny all client-side updates on the Instances collection
Evaluations.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

export const EvaluationSchema = new SimpleSchema({
    modelId: { type: String, required: false },
    timestamp: {
        type: Date,
        autoValue: () => { if (!this.isSet) return new Date(); },
    },
    results: { type: Object, blackbox: true },
    language: String,
    projectId: String,
});

if (Meteor.isServer) {
    Evaluations._ensureIndex({ modelId: 1, projectId: 1, language: 1 });
    Evaluations._ensureIndex({ projectId: 1, language: 1 });
    Meteor.publish('nlu_evaluations', function(projectId, language) { // eslint-disable-line
        check(projectId, String);
        check(language, String);

        try {
            checkIfCan('nlu-admin', projectId);
            return Evaluations.find({ projectId, language });
        } catch (e) {
            return [];
        }
    });
}

Evaluations.attachSchema(EvaluationSchema);
