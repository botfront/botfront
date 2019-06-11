import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { formatError, validateYaml } from '../lib/utils';
import { GlobalSettings } from './globalSettings/globalSettings.collection';
import { checkIfCan, can } from '../lib/scopes';

export const Rules = new Mongo.Collection('rules');
// Deny all client-side updates on the Rules collection
Rules.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

const getDefaultRules = () => {
    const fields = {
        'settings.private.defaultRules': 1,
    };
    const { settings: { private: { defaultRules = {} } = {} } = {} } = GlobalSettings.findOne({}, { fields }) || {};
    return defaultRules;
};

export const createRules = ({ _id: projectId }) => Rules.insert({ projectId, rules: getDefaultRules() });
export const RulesSchema = new SimpleSchema({
    rules: {
        type: String,
        defaultValue: Meteor.isServer ? getDefaultRules() : '',
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
        Rules._ensureIndex({ projectId: 1, updatedAt: -1 });
    }
});

Rules.attachSchema(RulesSchema);
if (Meteor.isServer) {
    Meteor.publish('rules', function (projectId) {
        check(projectId, String);
        if (can('project-settings:r', projectId, this.userId)) return Rules.find({ projectId });
        return this.ready();
    });

    Meteor.methods({
        'rules.save'(rules) {
            check(rules, Object);
            checkIfCan('project-settings:w', rules.projectId);
            try {
                return Rules.upsert({ projectId: rules.projectId }, { $set: { rules: rules.rules } });
            } catch (e) {
                throw formatError(e);
            }
        },
    });
}
