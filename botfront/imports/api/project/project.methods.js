import { check, Match } from 'meteor/check';
import { safeLoad as yamlLoad } from 'js-yaml';
import { Projects, createProject } from './project.collection';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { createInstance } from '../instances/instances.methods';
import { Instances } from '../instances/instances.collection';
import Activity from '../graphql/activity/activity.model';
import { getAllTrainingDataGivenProjectIdAndLanguage, setsAreIdentical, formatError } from '../../lib/utils';
import { CorePolicies, createPolicies } from '../core_policies';
import { createEndpoints } from '../endpoints/endpoints.methods';
import { Endpoints } from '../endpoints/endpoints.collection';
import { Credentials, createCredentials } from '../credentials';
import { checkIfCan } from '../../lib/scopes';
import { Conversations } from '../conversations';
import { createIntroStoryGroup, createDefaultStoryGroup } from '../storyGroups/storyGroups.methods';
import { StoryGroups } from '../storyGroups/storyGroups.collection';
import { Stories } from '../story/stories.collection';
import { Slots } from '../slots/slots.collection';
import { flattenStory, extractDomain, getAllTemplates } from '../../lib/story.utils';
import BotResponses from '../graphql/botResponses/botResponses.model';

if (Meteor.isServer) {
    export const extractDomainFromStories = (stories, slots) => yamlLoad(extractDomain(stories, slots, {}, {}, false));

    export const getExamplesFromTrainingData = (trainingData, startIntents = [], startEntities = []) => {
        /*  input: training data and optional initial arrays of intents and entities
            output: {
                entities: [entityName, ...]
                intents: {
                    intentName: [
                        {
                            entities: [entityName, ...]
                            example: <FULL_EXAMPLE>
                        },
                        ...
                    ],
                    ...
                }
            }
        */

        const entries = startIntents.map(i => [i, []]);
        const intents = {};
        entries.forEach((entry) => {
            const [key, value] = entry;
            intents[key] = value;
        });

        let entities = startEntities;

        trainingData
            .sort((a, b) => b.canonical || false - a.canonical || false)
            .forEach((ex) => {
                const exEntities = (ex.entities || []).map(en => en.entity);
                entities = entities.concat(exEntities.filter(en => !entities.includes(en)));
                if (!Object.keys(intents).includes(ex.intent)) intents[ex.intent] = [];
                if (!intents[ex.intent].some(ex2 => setsAreIdentical(ex2.entities, exEntities))) {
                    intents[ex.intent].push({ entities: exEntities, example: ex });
                }
            });
        return { intents, entities };
    };

    Meteor.methods({
        async 'project.insert'(item, bypassWithCI) {
            checkIfCan('projects:w', null, null, { bypassWithCI });
            check(item, Object);
            check(bypassWithCI, Match.Optional(Boolean));
            let _id;
            try {
                _id = createProject(item);
                createEndpoints({ _id, ...item });
                createCredentials({ _id, ...item });
                createPolicies({ _id, ...item });
                createIntroStoryGroup(_id);
                createDefaultStoryGroup(_id);
                await createInstance({ _id, ...item });
                return _id;
            } catch (e) {
                if (_id) Meteor.call('project.delete', _id);
                throw formatError(e);
            }
        },

        'project.update'(item) {
            checkIfCan('projects:w', item._id);
            check(item, Match.ObjectIncluding({ _id: String }));
            try {
                // eslint-disable-next-line no-param-reassign
                delete item.createdAt;
                return Projects.update({ _id: item._id }, { $set: item });
            } catch (e) {
                throw formatError(e);
            }
        },
        async 'project.delete'(projectId, options = { failSilently: false, bypassWithCI: false }) {
            checkIfCan('projects:w', null, null, options.bypassWithCI);
            check(projectId, String);
            check(options, Object);
            const { failSilently } = options;
            const project = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } });

            try {
                if (!project) throw new Meteor.Error('Project not found');
                NLUModels.remove({ _id: { $in: project.nlu_models } }); // Delete NLU models
                Activity.remove({ modelId: { $in: project.nlu_models } }).exec(); // Delete Logs
                Instances.remove({ projectId: project._id }); // Delete instances
                CorePolicies.remove({ projectId: project._id }); // Delete Core Policies
                Credentials.remove({ projectId: project._id }); // Delete credentials
                Endpoints.remove({ projectId: project._id }); // Delete endpoints
                Conversations.remove({ projectId: project._id });// Delete Conversations
                StoryGroups.remove({ projectId });
                Stories.remove({ projectId });
                Slots.remove({ projectId });
                Projects.remove({ _id: projectId }); // Delete project
                // Delete project related permissions for users (note: the role package does not provide
                const projectUsers = Meteor.users.find({ [`roles.${project._id}`]: { $exists: true } }, { fields: { roles: 1 } }).fetch();
                projectUsers.forEach(u => Meteor.users.update({ _id: u._id }, { $unset: { [`roles.${project._id}`]: '' } })); // Roles.removeUsersFromRoles doesn't seem to work so we unset manually
                await BotResponses.remove({ projectId });
            } catch (e) {
                if (!failSilently) throw e;
            }
        },

        'project.markTrainingStarted'(projectId) {
            checkIfCan('nlu-model:x', projectId);
            check(projectId, String);
            try {
                return Projects.update({ _id: projectId }, { $set: { training: { status: 'training', startTime: new Date() } } });
            } catch (e) {
                throw e;
            }
        },

        'project.markTrainingStopped'(projectId, status, error) {
            checkIfCan('nlu-model:x', projectId);
            check(projectId, String);
            check(status, String);
            check(error, Match.Optional(String));

            try {
                const set = { training: { status, endTime: new Date() } };
                if (error) {
                    set.training.message = error;
                }
                return Projects.update({ _id: projectId }, { $set: set });
            } catch (e) {
                throw e;
            }
        },

        async 'project.getEntitiesAndIntents'(projectId, language) {
            checkIfCan(['nlu-data:r', 'responses:r'], projectId);
            check(projectId, String);
            check(language, String);

            try {
                const stories = Stories.find({ projectId }).fetch();
                const slots = Slots.find({ projectId }).fetch();
                const {
                    intents: intentSetFromDomain = [],
                    entities: entitiesSetFromDomain = [],
                } = stories.length !== 0 ? extractDomainFromStories(
                    stories
                        .reduce((acc, story) => [...acc, ...flattenStory(story)], [])
                        .map(story => story.story || ''),
                    slots,
                ) : {};
                const trainingData = getAllTrainingDataGivenProjectIdAndLanguage(projectId, language);

                return getExamplesFromTrainingData(trainingData, intentSetFromDomain, entitiesSetFromDomain);
            } catch (error) {
                throw error;
            }
        },

        async 'project.getActions'(projectId) {
            // could use story.events subscription here??
            checkIfCan(['nlu-data:r', 'responses:r'], projectId);
            check(projectId, String);
            let { defaultDomain } = Projects.findOne({ _id: projectId }, { defaultDomain: 1 }) || { defaultDomain: { content: {} } };
            defaultDomain = yamlLoad(defaultDomain.content);
            const templates = await getAllTemplates(projectId);

            try {
                const stories = Stories.find({ projectId }).fetch();
                const slots = Slots.find({ projectId }).fetch();
                const {
                    actions: actionsSetFromDomain = [],
                } = stories.length !== 0 ? yamlLoad(extractDomain(
                    stories
                        .reduce((acc, story) => [...acc, ...flattenStory(story)], [])
                        .map(story => story.story || ''),
                    slots,
                    templates,
                    defaultDomain,
                )) : {};
                return actionsSetFromDomain;
            } catch (error) {
                throw error;
            }
        },

        async 'project.getDefaultLanguage'(projectId) {
            checkIfCan(['nlu-data:r', 'responses:r'], projectId);
            check(projectId, String);
            try {
                const { defaultLanguage } = Projects.findOne({ _id: projectId }, { fields: { defaultLanguage: 1 } });
                return defaultLanguage;
            } catch (error) {
                throw error;
            }
        },

        async 'project.getDeploymentEnvironments'(projectId) {
            checkIfCan(['incoming:r', 'projects:r'], projectId);
            check(projectId, String);
            try {
                const project = Projects.findOne({ _id: projectId }, { fields: { deploymentEnvironments: 1 } });
                const { deploymentEnvironments } = project;
                if (!deploymentEnvironments) return ['development']; // key doesn't exist
                if (!deploymentEnvironments.includes('development')) return ['development', ...deploymentEnvironments]; // key doesn't include dev
                return deploymentEnvironments;
            } catch (error) {
                throw error;
            }
        },
    });
}
