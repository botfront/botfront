import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import { can, getScopesForUser } from '../../lib/scopes';
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
        const isAllowed = () => {
            if (can('global-admin')) return true;
            const projectIds = getScopesForUser(this.userId, 'owner');
            const models = Projects.find({ _id: { $in: projectIds } }, { fields: { nlu_models: 1 } }).fetch();
            const modelIdArrays = models.map(m => m.nlu_models);
            const modelIds = [].concat(...modelIdArrays);
            return modelIds.includes(modelId);
        };
        
        return isAllowed() ? NLUModels.find({ _id: modelId }) : this.ready();
    });

    // This publication is here to get a list of accessible models
    // without having to download all the training data.
    // Thus greatly reducing the load times
    Meteor.publish('nlu_models.lite', function () {
        if (can('global-admin')) {
            return NLUModels.find({}, {
                fields: {
                    language: 1,
                    name: 1,
                    description: 1,
                    training: 1,
                    published: 1,
                    instance: 1,
                },
            });
        }

        const projectIds = getScopesForUser(this.userId, 'owner');
        const models = Projects.find({ _id: { $in: projectIds } }, { fields: { nlu_models: 1 } }).fetch();
        const modelIdArrays = models.map(m => m.nlu_models);
        const modelIds = [].concat(...modelIdArrays);
        return NLUModels.find(
            { _id: { $in: modelIds } },
            {
                fields: {
                    language: 1,
                    name: 1,
                    description: 1,
                    training: 1,
                    published: 1,
                },
            },
        );
    });

    Meteor.publish('nlu_models.project.training_data', function (projectId) {
        check(projectId, String);

        if (can('global-admin')) {
            const project = Projects.find({ _id: projectId }, { fields: { nlu_models: 1 } }).fetch();
            const modelIds = project[0].nlu_models;
            return NLUModels.find({ _id: { $in: modelIds } }, { fields: { 'training_data.common_examples': 1 } });
        }

        const projectIds = getScopesForUser(this.userId, 'owner');
        const models = Projects.find(
            { $and: [{ _id: { $in: projectIds } }, { _id: projectId }] },
            { fields: { nlu_models: 1 } },
        ).fetch();
        const modelIdArrays = models.map(m => m.nlu_models);
        const modelIds = [].concat(...modelIdArrays);
        return NLUModels.find({ _id: { $in: modelIds } }, { fields: { 'training_data.common_examples': 1 } });
    });
}

NLUModels.attachSchema(NLUModelSchema);
