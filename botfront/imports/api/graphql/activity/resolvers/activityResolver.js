/* eslint-disable no-unused-vars */
import {
    getActivities,
    upsertActivities,
    deleteActivities,
    addActivitiesToTraining,
} from '../mongo/activity';

export default {
    Query: {
        getActivities: async (_root, args) => getActivities(args),
    },

    Mutation: {
        upsertActivities: async (_root, args) => upsertActivities(args),
        deleteActivities: async (_root, args) => deleteActivities(args),
        addActivitiesToTraining: async (_root, args) => addActivitiesToTraining(args),
    },

    Activity: {
        _id: ({ _id }) => _id,
        modelId: ({ modelId }) => modelId,
        text: ({ text }) => text,
        intent: ({ intent }) => intent,
        entities: ({ entities }) => entities,
        confidence: ({ confidence }) => confidence,
        validated: ({ validated }) => validated,
        createdAt: ({ createdAt }) => createdAt,
        updatedAt: ({ updatedAt }) => updatedAt,
    },

    Entity: {
        start: ({ start }) => start,
        end: ({ end }) => end,
        value: ({ value }) => value,
        entity: ({ entity }) => entity,
        confidence: ({ confidence }) => confidence,
        extractor: ({ extractor }) => extractor,
        processors: ({ processors }) => processors,
    },
    
};
