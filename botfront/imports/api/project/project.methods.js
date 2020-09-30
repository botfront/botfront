import { check, Match } from 'meteor/check';
import { safeLoad as yamlLoad } from 'js-yaml';
import { isEqual } from 'lodash';
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
import { checkIfCan, can } from '../../lib/scopes';
import { Conversations } from '../conversations';
import {
    createDefaultStoryGroup,
    createStoriesWithTriggersGroup,
    createUnpublishedStoriesGroup,
} from '../storyGroups/storyGroups.methods';
import { StoryGroups } from '../storyGroups/storyGroups.collection';
import { Stories } from '../story/stories.collection';
import { Slots } from '../slots/slots.collection';
import Forms from '../graphql/forms/forms.model';
import { extractDomain, flattenStory, getAllResponses } from '../../lib/story.utils';
import BotResponses from '../graphql/botResponses/botResponses.model';
import FormResults from '../graphql/forms/form_results.model';
import AnalyticsDashboards from '../graphql/analyticsDashboards/analyticsDashboards.model';
import { defaultDashboard } from '../graphql/analyticsDashboards/generateDefaults';
import { getForms } from '../graphql/forms/mongo/forms';

import { languages as languageOptions } from '../../lib/languages';
import Examples from '../graphql/examples/examples.model';

if (Meteor.isServer) {
    import { auditLog } from '../../../server/logger';

    export const extractDomainFromStories = (stories, slots) => yamlLoad(extractDomain({ stories, slots, crashOnStoryWithErrors: false }));

    Meteor.methods({
        async 'project.insert'(item, bypassWithCI) {
            checkIfCan('projects:w', null, null, { bypassWithCI });
            check(item, Object);
            check(bypassWithCI, Match.Optional(Boolean));
            let _id;
            const left = Meteor.call('checkLicenseProjectLeft');
            if (left === 0) throw new Meteor.Error(500, 'Projects quota exceeded.');
            try {
                _id = createProject(item);
                AnalyticsDashboards.create(defaultDashboard({ _id, ...item }));
                createEndpoints({ _id, ...item });
                createCredentials({ _id, ...item });
                createPolicies({ _id, ...item });
                createStoriesWithTriggersGroup(_id);
                createUnpublishedStoriesGroup(_id);
                createDefaultStoryGroup(_id);
                await createInstance({ _id, ...item });
                auditLog('Created project', {
                    user: Meteor.user(),
                    resId: _id,
                    type: 'created',
                    operation: 'project-created',
                    after: { project: item },
                    resType: 'project',
                });
                return _id;
            } catch (e) {
                if (_id) Meteor.call('project.delete', _id);
                throw formatError(e);
            }
        },

        'project.update'(item) {
            checkIfCan('projects:w', item._id, undefined);
            check(item, Match.ObjectIncluding({ _id: String }));
            try {
                // eslint-disable-next-line no-param-reassign
                const projectBefore = Projects.findOne({ _id: item._id });
                if (projectBefore && 'deploymentEnvironments' in item
                    && !isEqual(projectBefore.deploymentEnvironments, item.deploymentEnvironments)
                ) {
                    checkIfCan('resources:w', item._id);
                }
                const update = item;
                delete update.createdAt;
                auditLog('Updated project', {
                    user: Meteor.user(),
                    resId: update._id,
                    type: 'updated',
                    projectId: update._id,
                    operation: 'project-updated',
                    before: { project: projectBefore },
                    after: { project: update },
                    resType: 'project',
                });
                return Projects.update({ _id: update._id }, { $set: update });
            } catch (e) {
                throw formatError(e);
            }
        },
        async 'project.delete'(
            projectId,
            options = { failSilently: false, bypassWithCI: false },
        ) {
            checkIfCan('projects:w', null, null, options.bypassWithCI);
            check(projectId, String);
            check(options, Object);
            const { failSilently } = options;
            const project = Projects.findOne(
                { _id: projectId },
                { fields: { _id: 1 } },
            );

            try {
                if (!project) throw new Meteor.Error('Project not found');
                const projectBefore = Projects.findOne({ _id: projectId });
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
                // Delete project related permissions for users (note: the role package does not provide
                const projectUsers = Meteor.users
                    .find(
                        { [`roles.${project._id}`]: { $exists: true } },
                        { fields: { roles: 1 } },
                    )
                    .fetch();
                projectUsers.forEach(u => Meteor.users.update(
                    { _id: u._id },
                    { $unset: { [`roles.${project._id}`]: '' } },
                )); // Roles.removeUsersFromRoles doesn't seem to work so we unset manually
                auditLog('Deleted project, all related data has been deleted', {
                    user: Meteor.user(),
                    resId: projectId,
                    type: 'deleted',
                    operation: 'project-deleted',
                    before: { projectBefore },
                    resType: 'project',
                });
                await Examples.remove({ projectId });
                await BotResponses.remove({ projectId });
                await AnalyticsDashboards.deleteOne({ projectId }); // Delete dashboards
                await Forms.remove({ projectId }); // Delete project
                await FormResults.remove({ projectId });
            } catch (e) {
                if (!failSilently) throw e;
            }
        },

        async 'project.getActions'(projectId) {
            // could use story.events subscription here??
            checkIfCan(['nlu-data:r', 'responses:r'], projectId);
            check(projectId, String);
            let { defaultDomain } = Projects.findOne({ _id: projectId }, { defaultDomain: 1 }) || { defaultDomain: { content: {} } };
            defaultDomain = yamlLoad(defaultDomain.content);
            const templates = await getAllResponses(projectId);

            try {
                const stories = Stories.find({ projectId }).fetch();
                const slots = Slots.find({ projectId }).fetch();
                const {
                    actions: actionsSetFromDomain = [],
                } = stories.length !== 0 ? yamlLoad(extractDomain({
                    stories: stories
                        .reduce((acc, story) => [...acc, ...flattenStory(story)], [])
                        .map(story => story.story || ''),
                    slots,
                    templates,
                    defaultDomain,
                })) : {};
                return actionsSetFromDomain;
            } catch (error) {
                throw error;
            }
        },

        'project.markTrainingStarted'(projectId) {
            checkIfCan('nlu-data:x', projectId);
            check(projectId, String);
            try {
                const projectBefore = Projects.findOne({ _id: projectId });
                const result = Projects.update(
                    { _id: projectId },
                    {
                        $set: {
                            training: {
                                instanceStatus: 'training',
                                startTime: new Date(),
                            },
                        },
                    },
                );
                const projectAfter = Projects.findOne({ _id: projectId });
                auditLog('Marked trainning as started', {
                    user: Meteor.user(),
                    resId: projectId,
                    projectId,
                    type: 'updated',
                    operation: 'project-updated',
                    before: { project: projectBefore },
                    after: { project: projectAfter },
                    resType: 'project',
                });
                return result;
            } catch (e) {
                throw e;
            }
        },

        'project.markTrainingStopped'(projectId, status, error) {
            checkIfCan('nlu-data:x', projectId);
            check(projectId, String);
            check(status, String);
            check(error, Match.Optional(String));

            try {
                const set = {
                    training: {
                        status,
                        instanceStatus: 'notTraining',
                        endTime: new Date(),
                    },
                };
                if (error) {
                    set.training.message = error;
                }
                const projectBefore = Projects.findOne({ _id: projectId });
                const result = Projects.update({ _id: projectId }, { $set: set });
                const projectAfter = Projects.findOne({ _id: projectId });
                auditLog('Marked trainning as stopped', {
                    user: Meteor.user(),
                    resId: projectId,
                    type: 'updated',
                    projectId,
                    operation: 'project-updated',
                    before: { projectBefore },
                    after: { projectAfter },
                    resType: 'project',
                });
                return result;
            } catch (e) {
                throw e;
            }
        },

        async 'project.getDefaultLanguage'(projectId) {
            checkIfCan(['nlu-data:r', 'responses:r'], projectId);
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

        async 'project.checkAllowContextualQuestions'(projectId) {
            checkIfCan(['stories:r'], projectId);
            check(projectId, String);
            try {
                const project = Projects.findOne(
                    { _id: projectId },
                    { fields: { allowContextualQuestions: 1 } },
                );
                const { allowContextualQuestions } = project;
                return !!allowContextualQuestions;
            } catch (error) {
                throw error;
            }
        },

        async 'project.setAllowContextualQuestions'(projectId, allowContextualQuestions) {
            checkIfCan(['stories:w'], projectId);
            check(projectId, String);
            check(allowContextualQuestions, Boolean);
            try {
                const project = Projects.findOne(
                    { _id: projectId },
                    { fields: { allowContextualQuestions: 1 } },
                );
                const { allowContextualQuestions: aCQBefore } = project;
                const result = Projects.update(
                    { _id: projectId },
                    { $set: { allowContextualQuestions } },
                );
                auditLog('Setting allow contextual questions', {
                    user: Meteor.user(),
                    resId: projectId,
                    type: 'updated',
                    projectId,
                    operation: 'project-updated',
                    before: { allowContextualQuestions: aCQBefore },
                    after: { allowContextualQuestions },
                    resType: 'project',
                });
                return result;
            } catch (error) {
                throw error;
            }
        },

        async 'project.getContextualSlot'(projectId) {
            check(projectId, String);
            if (!can(['stories:r'], projectId)) return null;
            checkIfCan(['stories:r'], projectId);

            const project = Projects.findOne(
                { _id: projectId },
                { fields: { allowContextualQuestions: 1 } },
            );
            const { allowContextualQuestions } = project;

            if (!allowContextualQuestions) return null;

            const bfForms = await getForms(projectId);
            let requestedSlotCategories = [];

            bfForms.forEach((form) => {
                requestedSlotCategories = requestedSlotCategories.concat(
                    form.slots.map(slot => slot.name),
                );
            });

            const requestedSlot = {
                name: 'requested_slot',
                projectId,
                type: 'categorical',
                categories: [...new Set(requestedSlotCategories)],
            };

            return requestedSlot;
        },

        async 'project.setEnableSharing'(projectId, enableSharing) {
            check(projectId, String);
            check(enableSharing, Boolean);
            return Projects.update({ _id: projectId }, { $set: { enableSharing } });
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
                    chatWidgetSettings: 1,
                    enableSharing: 1,
                    name: 1,
                    defaultLanguage: 1,
                    languages: 1,
                },
            ) || {};

            if (!projectName) {
                throw new Meteor.Error(404, `Project '${projectName}' not found.`);
            }
            if (!enableSharing) {
                throw new Meteor.Error(
                    403,
                    `Sharing not enabled for project '${projectName}'.`,
                );
            }

            const query = {
                $or: [
                    { projectId, environment: { $exists: false } },
                    { projectId, environment: 'development' },
                ],
            };
            let { credentials = '' } = Credentials.findOne(query, { credentials: 1 }) || {};
            credentials = yamlLoad(credentials);
            const channel = Object.keys(credentials).find(k => ['WebchatInput', 'WebchatPlusInput'].some(c => k.includes(c)));
            if (!channel) {
                throw new Meteor.Error(
                    404,
                    `No credentials found for project '${projectName}'.`,
                );
            }
            const { base_url: socketUrl, socket_path: socketPath } = credentials[channel];

            const languages = langs.map(value => ({
                text: languageOptions[value].name,
                value,
            }));

            if (!languages.length) {
                throw new Meteor.Error(
                    404,
                    `No languages found for project '${projectName}'.`,
                );
            }

            return {
                projectName,
                socketUrl,
                socketPath,
                languages,
                defaultLanguage,
                initPayload,
            };
        },

        async 'project.getCount'() {
            try {
                return Projects.find().count();
            } catch (error) {
                throw error;
            }
        },
    });
}
