import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { checkIfCan, can } from '../lib/scopes';
import { formatError, validateYaml } from '../lib/utils';
import { GlobalSettings } from './globalSettings/globalSettings.collection';

export const Credentials = new Mongo.Collection('credentials');
// Deny all client-side updates on the Credentials collection
Credentials.deny({
    insert() {
        return true;
    },
    update() {
        return true;
    },
    remove() {
        return true;
    },
});

const getDefaultCredentials = () => {
    if (!Meteor.isServer) throw new Meteor.Error(401, 'Unauthorized');
    const fields = {
        'settings.private.defaultCredentials': 1,
    };
    let { settings: { private: { defaultCredentials = '' } = {} } = {} } = GlobalSettings.findOne({}, { fields }) || {};
    if (process.env.MODE === 'test') {
        defaultCredentials = defaultCredentials.replace(/localhost:5005/g, 'rasa:5005');
    }
    return defaultCredentials;
};

export const createCredentials = ({ _id: projectId }) => Credentials.insert({ projectId, credentials: getDefaultCredentials() });

export const CredentialsSchema = new SimpleSchema(
    {
        credentials: {
            type: String,
            custom: validateYaml,
        },
        projectId: { type: String },
        createdAt: {
            type: Date,
            optional: true,
            // autoValue: () => this.isUpdate ? this.value : new Date() //TODO find out why it's always updated
        },
        environment: {
            type: String,
            optional: true,
        },
        updatedAt: {
            type: Date,
            optional: true,
            autoValue: () => new Date(),
        },
    },
    { tracker: Tracker },
);

Meteor.startup(() => {
    if (Meteor.isServer) {
        Credentials._ensureIndex({ projectId: 1, updatedAt: -1 });
    }
});

Credentials.attachSchema(CredentialsSchema);
if (Meteor.isServer) {
    Meteor.publish('credentials', function(projectId) {
        check(projectId, String);
        if (can('project-settings:r', projectId, this.userId)) return Credentials.find({ projectId });
        return this.ready();
    });

    Meteor.methods({
        'credentials.save'(credentials) {
            check(credentials, Object);
            checkIfCan('project-settings:w', credentials.projectId);
            try {
                return Credentials.upsert({
                    projectId: credentials.projectId,
                }, { $set: { credentials: credentials.credentials, environment: credentials.environment } });
            } catch (e) {
                throw formatError(e);
            }
        },
    });
}
