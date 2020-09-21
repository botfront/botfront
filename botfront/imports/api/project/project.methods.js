import { check, Match } from 'meteor/check';
import { safeLoad as yamlLoad } from 'js-yaml';
import { Projects, createProject } from './project.collection';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { createInstance } from '../instances/instances.methods';
import { Instances } from '../instances/instances.collection';
import Activity from '../graphql/activity/activity.model';
import { formatError } from '../../lib/utils';
import { CorePolicies, createPolicies } from '../core_policies';
import { createEndpoints } from '../endpoints/endpoints.methods';
import { Endpoints } from '../endpoints/endpoints.collection';
import { Credentials, createCredentials } from '../credentials';
import { Conversations } from '../conversations';
import { createDefaultStoryGroup } from '../storyGroups/storyGroups.methods';
import { StoryGroups } from '../storyGroups/storyGroups.collection';
import { Stories } from '../story/stories.collection';
import { Slots } from '../slots/slots.collection';
import { extractDomain } from '../../lib/story.utils';
import { languages as languageOptions } from '../../lib/languages';
import BotResponses from '../graphql/botResponses/botResponses.model';
import Examples from '../graphql/examples/examples.model';

if (Meteor.isServer) {
    export const extractDomainFromStories = (stories, slots) => yamlLoad(extractDomain({ stories, slots, crashOnStoryWithErrors: false }));

    Meteor.methods({
        async 'project.insert'(item) {
            check(item, Object);
            let _id;
            try {
                _id = createProject(item);
                createEndpoints({ _id, ...item });
                createCredentials({ _id, ...item });
                createPolicies({ _id, ...item });
                createDefaultStoryGroup(_id);
                await createInstance({ _id, ...item });
                return _id;
            } catch (e) {
                if (_id) Meteor.call('project.delete', _id);
                throw formatError(e);
            }
        },

        'project.update'(item) {
            check(item, Match.ObjectIncluding({ _id: String }));
            try {
                // eslint-disable-next-line no-param-reassign
                delete item.createdAt;
                return Projects.update({ _id: item._id }, { $set: item });
            } catch (e) {
                throw formatError(e);
            }
        },
        async 'project.delete'(projectId, options = { failSilently: false }) {
            check(projectId, String);
            check(options, Object);
            const { failSilently } = options;
            const project = Projects.findOne(
                { _id: projectId },
                { fields: { nlu_models: 1 } },
            );

            try {
                if (!project) throw new Meteor.Error('Project not found');
                NLUModels.remove({ projectId }); // Delete NLU models
                Activity.remove({ projectId }).exec(); // Delete Logs
                Instances.remove({ projectId }); // Delete instances
                CorePolicies.remove({ projectId }); // Delete Core Policies
                Credentials.remove({ projectId }); // Delete credentials
                Endpoints.remove({ projectId }); // Delete endpoints
                Conversations.remove({ projectId }); // Delete Conversations
                StoryGroups.remove({ projectId });
                Stories.remove({ projectId });
                Slots.remove({ projectId });
                Projects.remove({ _id: projectId }); // Delete project
                await Examples.remove({ projectId });
                await BotResponses.remove({ projectId });
            } catch (e) {
                if (!failSilently) throw e;
            }
        },

        'project.markTrainingStarted'(projectId) {
            check(projectId, String);

            try {
                return Projects.update({ _id: projectId }, { $set: { training: { instanceStatus: 'training', startTime: new Date() } } });
            } catch (e) {
                throw e;
            }
        },

        'project.markTrainingStopped'(projectId, status, error) {
            check(projectId, String);
            check(status, String);
            check(error, Match.Optional(String));

            try {
                const set = { training: { status, instanceStatus: 'notTraining', endTime: new Date() } };
                if (error) {
                    set.training.message = error;
                }
                return Projects.update({ _id: projectId }, { $set: set });
            } catch (e) {
                throw e;
            }
        },

        async 'project.getDefaultLanguage'(projectId) {
            check(projectId, String);
            try {
                const { defaultLanguage } = Projects.findOne(
                    { _id: projectId },
                    { fields: { defaultLanguage: 1 } },
                );
                return defaultLanguage;
            } catch (error) {
                throw error;
            }
        },

        async 'project.setEnableSharing'(projectId, enableSharing) {
            check(projectId, String);
            check(enableSharing, Boolean);
            return Projects.update(
                { _id: projectId },
                { $set: { enableSharing } },
            );
        },

        async 'project.getChatProps'(projectId) {
            check(projectId, String);

            const {
                chatWidgetSettings: { initPayload = '/get_started' } = {},
                enableSharing,
                name: projectName,
                languages: langs,
                defaultLanguage,
            } = Projects.findOne(
                { _id: projectId },
                {
                    chatWidgetSettings: 1, enableSharing: 1, name: 1, defaultLanguage: 1, languages: 1,
                },
            ) || {};

            if (!projectName) { throw new Meteor.Error(404, `Project '${projectName}' not found.`); }
            if (!enableSharing) { throw new Meteor.Error(403, `Sharing not enabled for project '${projectName}'.`); }

            const query = {
                $or: [
                    { projectId, environment: { $exists: false } },
                    { projectId, environment: 'development' },
                ],
            };
            let { credentials = '' } = Credentials.findOne(query, { credentials: 1 }) || {};
            credentials = yamlLoad(credentials);
            const channel = Object.keys(credentials).find(k => ['WebchatInput', 'WebchatPlusInput'].some(c => k.includes(c)));
            if (!channel) { throw new Meteor.Error(404, `No credentials found for project '${projectName}'.`); }
            const { base_url: socketUrl, socket_path: socketPath } = credentials[channel];

            const languages = langs.map(value => ({ text: languageOptions[value].name, value }));

            if (!languages.length) { throw new Meteor.Error(404, `No languages found for project '${projectName}'.`); }

            return {
                projectName,
                socketUrl,
                socketPath,
                languages,
                defaultLanguage,
                initPayload,
            };
        },
    });
}
