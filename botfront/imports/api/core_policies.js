import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { formatError, validateYaml } from '../lib/utils';
import { GlobalSettings } from './globalSettings/globalSettings.collection';

export const CorePolicies = new Mongo.Collection('core_policies');
// Deny all client-side updates on the CorePolicies collection
CorePolicies.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

const getDefaultPolicies = () => {
    const fields = {
        'settings.private.defaultPolicies': 1,
    };
    const { settings: { private: { defaultPolicies = {} } = {} } = {} } = GlobalSettings.findOne({}, { fields }) || {};
    return defaultPolicies;
};

export const createPolicies = ({ _id: projectId }) => CorePolicies.insert({ projectId, policies: getDefaultPolicies() });
export const CorePolicySchema = new SimpleSchema({
    policies: {
        type: String,
        defaultValue: Meteor.isServer ? getDefaultPolicies() : '',
        custom: validateYaml,
    },
    projectId: { type: String },
    createdAt: {
        type: Date,
        optional: true,
        defaultValue: new Date(),
        // autoValue: () => this.isUpdate ? this.value : new Date() //TODO find out why it's always updated
    },
    updatedAt: {
        type: Date,
        optional: true,
        autoValue: () => new Date(),
    },

}, { tracker: Tracker });

Meteor.startup(() => {
    if (Meteor.isServer) {
        CorePolicies._ensureIndex({ projectId: 1, updatedAt: -1 });
    }
});

CorePolicies.attachSchema(CorePolicySchema);
if (Meteor.isServer) {
    Meteor.publish('policies', function (projectId) {
        check(projectId, String);
        return CorePolicies.find({ projectId });
    });

    Meteor.methods({
        'policies.save'(policies) {
            check(policies, Object);
            try {
                return CorePolicies.upsert({ projectId: policies.projectId }, { $set: { policies: policies.policies } });
            } catch (e) {
                throw formatError(e);
            }
        },
    });
}
