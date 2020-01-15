import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import { Projects } from '../project/project.collection';
import { NLUModelSchema } from './nlu_model.schema';

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
        return NLUModels.find({ _id: modelId });
    });

    // This publication is here to get a list of accessible models
    // without having to download all the training data.
    // Thus greatly reducing the load times
    Meteor.publish('nlu_models.lite', function () {
        return NLUModels.find({}, {
            fields: {
                language: 1,
                name: 1,
                description: 1,
                training: 1,
            },
        });
    });

    Meteor.publish('nlu_models.project.training_data', function (projectId) {
        check(projectId, String);
        const project = Projects.find({ _id: projectId }, { fields: { nlu_models: 1 } }).fetch();
        const modelIds = project[0].nlu_models;
        return NLUModels.find({ _id: { $in: modelIds } }, { fields: { 'training_data.common_examples': 1 } });
    });
}

NLUModels.attachSchema(NLUModelSchema);
