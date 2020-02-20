import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { checkIfCan, can } from '../lib/scopes';
import { formatError, validateYaml } from '../lib/utils';
import { GlobalSettings } from './globalSettings/globalSettings.collection';

import { ENVIRONMENT_OPTIONS } from '../ui/components/constants.json';

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

const getDefaultCredentials = ({ namespace }) => {
    if (!Meteor.isServer) throw new Meteor.Error(401, 'Unauthorized');
    const fields = {
        'settings.private.defaultCredentials': 1,
        'settings.private.socketHost': 1,
    };
    const { settings: { private: { defaultCredentials = '', socketHost = '' } = {} } = {} } = GlobalSettings.findOne({}, { fields }) || {};
    return defaultCredentials
        .replace(/{SOCKET_HOST}/g, socketHost)
        .replace(/{PROJECT_NAMESPACE}/g, namespace);
};

export const createCredentials = ({ _id: projectId, namespace }) => {
    ENVIRONMENT_OPTIONS.forEach((environment) => {
        Credentials.insert({ projectId, environment, credentials: getDefaultCredentials({ namespace }) });
    });
};

export const CredentialsSchema = new SimpleSchema(
    {
        credentials: {
            type: String,
            custom: validateYaml,
        },
        environment: { type: String, optional: true },
        projectId: { type: String },
        createdAt: {
            type: Date,
            optional: true,
            // autoValue: () => this.isUpdate ? this.value : new Date() //TODO find out why it's always updated
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
        try {
            checkIfCan(['nlu-data:r', 'projects:r', 'responses:r'], projectId);
        } catch (err) {
            return this.ready();
        }
        check(projectId, String);
        return Credentials.find({ projectId });
    });

    Meteor.methods({
        'credentials.save'(credentials) {
            checkIfCan('projects:w', credentials.projectId, undefined, { operationType: 'credentials-updated' });
            check(credentials, Object);
            try {
                return Credentials.upsert(
                    { projectId: credentials.projectId, _id: credentials._id },
                    {
                        $set: {
                            projectId: credentials.projectId,
                            credentials: credentials.credentials,
                            environment: credentials.environment,
                        },
                    },
                );
            } catch (e) {
                throw formatError(e);
            }
        },
    });
}
