import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { safeLoad, safeDump } from 'js-yaml';
import { get } from 'lodash';
import { getWebchatRules } from './graphql/config/webchatProps';
import { checkIfCan } from '../lib/scopes';
import { formatError, validateYaml } from '../lib/utils';
import { GlobalSettings } from './globalSettings/globalSettings.collection';
import { Projects } from './project/project.collection';
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
    };
    let { settings: { private: { defaultCredentials = '' } = {} } = {} } = GlobalSettings.findOne({}, { fields }) || {};
    if (process.env.MODE === 'test') {
        defaultCredentials = defaultCredentials.replace(/localhost:5005/g, 'rasa:5005');
    }
    return defaultCredentials.replace(/{PROJECT_NAMESPACE}/g, namespace);
};
export const createCredentials = ({ _id: projectId, namespace }) => {
    ENVIRONMENT_OPTIONS.forEach(environment => Credentials.insert({
        projectId,
        environment,
        credentials: getDefaultCredentials({ namespace }),
    }));
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
    import { auditLog } from '../../server/logger';

    Meteor.publish('credentials', function (projectId) {
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
            checkIfCan(['projects:w', 'import:x'], credentials.projectId);
            check(credentials, Object);
            try {
                const env = credentials.environment || 'development';
                const envQuery = env !== 'development'
                    ? { environment: env }
                    : {
                        $or: [
                            { environment: env },
                            { environment: { $exists: false } },
                        ],
                    };
                const credentialsBefore = Credentials.findOne({
                    projectId: credentials.projectId,
                    ...envQuery,
                });
                auditLog('Saved credentials', {
                    user: Meteor.user(),
                    projectId: credentials.projectId,
                    type: 'updated',
                    operation: 'project-updated',
                    resId: credentials._id,
                    after: { credentials },
                    before: { credentials: credentialsBefore },
                    resType: 'project',
                });
                return Credentials.upsert(
                    { projectId: credentials.projectId, ...envQuery },
                    { $set: { credentials: credentials.credentials } },
                );
            } catch (e) {
                throw formatError(e);
            }
        },
        async 'credentials.appendWidgetSettings'(projectId, env) {
            checkIfCan('projects:w', projectId);
            check(projectId, String);
            check(env, String);
            try {
                const credentials = Credentials.findOne({ projectId, environment: env });
                const rules = await getWebchatRules(projectId, env);
                const { chatWidgetSettings, defaultLanguage } = Projects.findOne(
                    { _id: projectId },
                    { fields: { chatWidgetSettings: 1, defaultLanguage: 1 } },
                );
                const props = { ...chatWidgetSettings, rules };
                const jsCrendentials = safeLoad(credentials.credentials);
                const lang = get(props, 'customData');
                if (lang && typeof lang === 'string') {
                    props.customData = JSON.parse(props.customData);
                } else if (lang === undefined || Object.keys(lang).length === 0) {
                    props.customData = { language: defaultLanguage };
                }
                if (
                    jsCrendentials[
                        'rasa_addons.core.channels.rest_plus.BotfrontRestPlusInput'
                    ]
                ) {
                    jsCrendentials[
                        'rasa_addons.core.channels.rest_plus.BotfrontRestPlusInput'
                    ].config = props;
                }

                if (
                    jsCrendentials[
                        'rasa_addons.core.channels.webchat_plus.WebchatPlusInput'
                    ]
                ) {
                    jsCrendentials[
                        'rasa_addons.core.channels.webchat_plus.WebchatPlusInput'
                    ].config = props;
                }
                const newCredentials = {
                    projectId,
                    environment: env,
                    credentials: safeDump(jsCrendentials),
                };
                return Meteor.call('credentials.save', newCredentials);
            } catch (e) {
                throw formatError(e);
            }
        },
    });
}
