import { check, Match } from 'meteor/check';
import { safeLoad as yamlLoad } from 'js-yaml';
import { Projects } from './project.collection';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { createInstance } from '../instances/instances.methods';
import { Instances } from '../instances/instances.collection';
import { ActivityCollection } from '../activity';
import { formatError } from '../../lib/utils';
import { CorePolicies, createPolicies } from '../core_policies';
import { createEndpoints } from '../endpoints/endpoints.methods';
import { Endpoints } from '../endpoints/endpoints.collection';
import { Credentials, createCredentials } from '../credentials';
import { createDeployment } from '../deployment/deployment.methods';
import { Deployments } from '../deployment/deployment.collection';
import { createIntroStoryGroup, createDefaultStoryGroup } from '../storyGroups/storyGroups.methods';
import { StoryGroups } from '../storyGroups/storyGroups.collection';
import { Stories } from '../story/stories.collection';
import { Slots } from '../slots/slots.collection';
import { extractDomain } from '../../lib/story_controller';
import { flattenStory } from '../../lib/story.utils';

if (Meteor.isServer) {
    export const extractDomainFromStories = (stories, slots) => yamlLoad(extractDomain(stories, slots));

    export const extractData = (models) => {
        const trainingExamples = models.map(model => model.training_data.common_examples);
        let intents = [];
        let entities = [];
        if (trainingExamples.length !== 0) {
            const trainingData = trainingExamples.reduce((acc, x) => acc.concat(x));
            // extract intents and entities from common examples of training data
            intents = trainingData.map(example => example.intent);
            entities = trainingData.map(example => example.entities);
            if (entities.length !== 0) {
                entities = entities.reduce((acc, x) => acc.concat(x));
                entities = entities.map(entity => entity.entity);
            }
            return {
                intents: new Set(intents),
                entities: new Set(entities),
            };
        }
        // return empty set if training data is empty
        return {
            intents: new Set(),
            entities: new Set(),
        };
    };

    export const getExamplesFromTrainingData = (projectId) => {
        // Get all the Nlu model ids belonging to the project
        const { nlu_models: nluModelIds } = Projects.findOne(
            { _id: projectId },
            { fields: { nlu_models: 1 } },
        );
        const models = NLUModels.find(
            { _id: { $in: nluModelIds } },
            { fields: { training_data: 1 } },
        ).fetch();
        // returns extracted entities and intents
        return extractData(models);
    };

    Meteor.methods({
        async 'project.insert'(item) {
            check(item, Object);
            let _id;
            try {
                _id = Projects.insert(item);
                createEndpoints({ _id, ...item });
                createDeployment({ _id, ...item });
                createCredentials({ _id, ...item });
                createPolicies({ _id, ...item });
                createIntroStoryGroup(_id);
                createDefaultStoryGroup(_id);
                const instance = await createInstance({ _id, ...item });
                Projects.update({ _id }, { $set: { instance } });
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

        'project.delete'(projectId, options) {
            check(projectId, String);
            check(options, Match.Optional(Object));
            const { failSilently } = options;
            const project = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } });

            try {
                if (!project) throw new Meteor.Error('Project not found');
                NLUModels.remove({ _id: { $in: project.nlu_models } }); // Delete NLU models
                ActivityCollection.remove({ modelId: { $in: project.nlu_models } }); // Delete Logs
                Instances.remove({ projectId: project._id }); // Delete instances
                CorePolicies.remove({ projectId: project._id }); // Delete Core Policies
                Credentials.remove({ projectId: project._id }); // Delete credentials
                Endpoints.remove({ projectId: project._id }); // Delete endpoints
                StoryGroups.remove({ projectId });
                Stories.remove({ projectId });
                Slots.remove({ projectId });
                Projects.remove({ _id: projectId }); // Delete project
                Deployments.remove({ projectId }); // Delete deployment
            } catch (e) {
                if (!failSilently) throw e;
            }
        },

        'project.markTrainingStarted'(projectId) {
            check(projectId, String);

            try {
                return Projects.update({ _id: projectId }, { $set: { training: { status: 'training', startTime: new Date() } } });
            } catch (e) {
                throw e;
            }
        },

        'project.markTrainingStopped'(projectId, status, error) {
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

        async 'project.getEntitiesAndIntents'(projectId) {
            check(projectId, String);

            try {
                const stories = await Meteor.callWithPromise('stories.getStories', projectId);
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
                const {
                    intents: intentSetFromTraining,
                    entities: entitiesSetFromTraining,
                } = getExamplesFromTrainingData(projectId);

                const intents = Array.from(new Set([...intentSetFromDomain, ...intentSetFromTraining]));
                const entities = Array.from(new Set([...entitiesSetFromDomain, ...entitiesSetFromTraining]));
                return {
                    intents,
                    entities,
                };
            } catch (error) {
                throw error;
            }
        },

        async 'project.getSlots'(projectId) {
            check(projectId, String);

            try {
                const slots = await Meteor.callWithPromise('slots.getSlots', projectId);
                return slots;
            } catch (error) {
                throw error;
            }
        },
    });
}
