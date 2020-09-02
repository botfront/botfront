import {
    getExamples,
    listIntentsAndEntities,
    insertExamples,
    updateExamples,
    deleteExamples,
    switchCanonical,
} from '../mongo/examples.js';
import { getIntentStatistics } from '../mongo/statistics';

const { PubSub, withFilter } = require('apollo-server-express');

const pubsub = new PubSub();
const INTENTS_OR_ENTITIES_CHANGED = 'INTENTS_OR_ENTITIES_CHANGED';

const publishIntentsOrEntitiesChanged = (projectId, language) => pubsub.publish(
    INTENTS_OR_ENTITIES_CHANGED,
    { projectId, language, intentsOrEntitiesChanged: { changed: true } },
);

export default {
    Query: {
        async examples(_, { exactMatch, countOnly, ...args }, __) {
            return getExamples({ ...args, options: { exactMatch, countOnly } });
        },
        async listIntentsAndEntities(_, args, __) {
            return listIntentsAndEntities(args);
        },
        getIntentStatistics: async (_root, args) => {
            const { projectId, language } = args;
            const stats = await getIntentStatistics({ projectId });
            return stats.map(({ intent, languages }) => ({
                intent,
                example: (languages.filter(l => l.language === language)[0] || {}).example || null,
                counts: languages.map(({ example, ...rest }) => rest),
            }));
        },
    },
    Subscription: {
        intentsOrEntitiesChanged: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([INTENTS_OR_ENTITIES_CHANGED]),
                (payload, variables) => payload.projectId === variables.projectId
                    && payload.language === variables.language,
            ),
        },
    },
    Mutation: {
        async updateExamples(_, args, __) {
            const response = await updateExamples(args);
            const { projectId, language } = args;
            publishIntentsOrEntitiesChanged(projectId, language);
            return response;
        },
        async insertExamples(_, args, __) {
            const response = await insertExamples(args);
            if (response.length > 0) {
                const { projectId, language } = args;
                publishIntentsOrEntitiesChanged(projectId, language);
            }
            return response;
        },
        async deleteExamples(_, args, __) {
            const response = await deleteExamples(args);
            return response;
        },
        async switchCanonical(_, args, __) {
            const response = await switchCanonical(args);
            return response;
        },
    

    },

    ExamplePage: {
        examples: (parent, _, __) => parent.examples,
        pageInfo: (parent, _, __) => parent.pageInfo,
    },
    IntentsAndEntitiesList: {
        intents: ({ intents }) => intents,
        entities: ({ entities }) => entities,
    },
    Example: {
        projectId: (parent, _, __) => parent.projectId,
        _id: (parent, _, __) => parent._id,
        text: (parent, _, __) => parent.text,
        intent: (parent, _, __) => parent.intent,
        entities: (parent, _, __) => parent.entities,
        metadata: (parent, _, __) => parent.metadata,
        draft: (parent, _, __) => parent.draft,

    },
    NluStatistics: {
        intent: ({ intent }) => intent,
        example: ({ example }) => example,
        counts: ({ counts }) => counts,
    },

    NluStatisticsByLanguage: {
        language: ({ language }) => language,
        count: ({ count }) => count,
    },
    PageInfo: {
        endCursor: (parent, _, __) => parent.endCursor,
        hasNextPage: (parent, _, __) => parent.hasNextPage,
    },
};
