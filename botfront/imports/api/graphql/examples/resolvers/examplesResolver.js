import {
    getExamples,
    listIntentsAndEntities,
    insertExamples,
    updateExamples,
    deleteExamples,
    switchCanonical,
} from '../mongo/examples.js';
import { getIntentStatistics } from '../mongo/statistics';
import { can, checkIfCan } from '../../../../lib/scopes';
import { auditLog } from '../../../../../server/logger';

const { PubSub, withFilter } = require('apollo-server-express');

const pubsub = new PubSub();
const INTENTS_OR_ENTITIES_CHANGED = 'INTENTS_OR_ENTITIES_CHANGED';

export const publishIntentsOrEntitiesChanged = (projectId, language) => pubsub.publish(
    INTENTS_OR_ENTITIES_CHANGED,
    { projectId, language, intentsOrEntitiesChanged: { changed: true } },
);


export const subscriptionFilter = (payload, variables, context) => {
    if (
        can('nlu-data:r', payload.projectId, context.userId)
    ) {
        return payload.projectId === variables.projectId
        && payload.language === variables.language;
    }
    return false;
};

export default {
    Query: {
        async examples(_, { matchEntityName, countOnly, ...args }, context) {
            checkIfCan('nlu-data:r', args.projectId, context.user._id);
            return getExamples({ ...args, options: { matchEntityName, countOnly } });
        },
        async listIntentsAndEntities(_, args, context) {
            checkIfCan('nlu-data:r', args.projectId, context.user._id);
            return listIntentsAndEntities(args);
        },
        getIntentStatistics: async (_root, args, context) => {
            const { projectId, language } = args;
            checkIfCan('nlu-data:r', projectId, context.user._id);
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
                () => pubsub.asyncIterator([INTENTS_OR_ENTITIES_CHANGED]), subscriptionFilter
                ,
            ),
        },
    },
    Mutation: {
        async updateExamples(_, args, context) {
            checkIfCan('nlu-data:w', args.projectId, context.user._id);
            const response = await updateExamples(args);
            auditLog('updated examples', {
                user: context.user,
                type: 'updated',
                projectId: args.projectId,
                operation: 'nlu-data-updated',
                resId: args.key,
                after: { examples: response },
                resType: 'examples',
            });
            const { projectId, language } = args;
            publishIntentsOrEntitiesChanged(projectId, language);
            return response;
        },
        async insertExamples(_, args, context) {
            checkIfCan('nlu-data:w', args.projectId, context.user._id);
            const response = await insertExamples(args);
            auditLog('inserted examples', {
                user: context.user,
                type: 'inserted',
                projectId: args.projectId,
                operation: 'nlu-data-inserted',
                resId: args.key,
                after: { examples: response },
                resType: 'examples',
            });
            if ((response || []).length > 0) {
                const { projectId, language } = args;
                publishIntentsOrEntitiesChanged(projectId, language);
            }
            return response;
        },
        async deleteExamples(_, args, context) {
            checkIfCan('nlu-data:w', args.projectId, context.user._id);
            const response = await deleteExamples(args);
            auditLog('deleted examples', {
                user: context.user,
                type: 'deleted',
                projectId: args.projectId,
                operation: 'nlu-data-deleted',
                resId: args.key,
                after: { Deletedexamples: response },
                resType: 'examples',
            });
            return response;
        },
        async switchCanonical(_, args, context) {
            checkIfCan('nlu-data:w', args.projectId, context.user._id);
            const response = await switchCanonical(args);
            auditLog('deleted examples', {
                user: context.user,
                type: 'deleted',
                projectId: args.projectId,
                operation: 'nlu-data-deleted',
                resId: args.key,
                before: { examples: args.example },
                after: { examples: response },
                resType: 'examples',
            });
            const { projectId, language } = args;
            publishIntentsOrEntitiesChanged(projectId, language);
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
