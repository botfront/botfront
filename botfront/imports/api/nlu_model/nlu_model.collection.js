import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';

import { checkIfCan } from '../../lib/scopes';
import { Projects } from '../project/project.collection';
import { NLUModelSchema } from './nlu_model.schema';
import { getProjectIdFromModelId } from '../../lib/utils';

export const NLUModels = new Mongo.Collection('nlu_models');

// Deny all client-side updates on the NLUModels collection
NLUModels.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

if (Meteor.isServer) {
    Meteor.publish('nlu_models', function (modelId) {
        check(modelId, String);
        const projectId = getProjectIdFromModelId(modelId);
        checkIfCan('nlu-data:r', projectId);
        return NLUModels.find({ _id: modelId });
    });

    // This publication is here to get a list of accessible models
    // without having to download all the training data.
    // Thus greatly reducing the load times
    Meteor.publish('nlu_models.lite', function (projectId) {
        checkIfCan(['nlu-model:r', 'responses:r', 'projects:r'], projectId);
        check(projectId, String);
        const models = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } });
        return NLUModels.find({ _id: { $in: models.nlu_models } }, {
            fields: {
                language: 1,
                name: 1,
                description: 1,
                training: 1,
                instance: 1,
            },
        });
    });
}

NLUModels.attachSchema(NLUModelSchema);
