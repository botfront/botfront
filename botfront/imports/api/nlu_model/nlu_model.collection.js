import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import { checkIfCan } from '../../lib/scopes';
import { NLUModelSchema } from './nlu_model.schema';

export const NLUModels = new Mongo.Collection('nlu_models');

// Deny all client-side updates on the NLUModels collection
NLUModels.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

if (Meteor.isServer) {
    Meteor.publish('nlu_models', function (projectId) {
        check(projectId, String);
        checkIfCan('nlu-data:r', projectId);
        return NLUModels.find({ projectId });
    });
}

NLUModels.attachSchema(NLUModelSchema);
