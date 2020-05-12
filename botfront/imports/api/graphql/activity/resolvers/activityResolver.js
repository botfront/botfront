import {
    getActivity,
    upsertActivity,
    deleteActivity,
} from '../mongo/activity';
import { checkIfCan } from '../../../../lib/scopes';
import { getProjectIdFromModelId } from '../../../../lib/utils';

export default {
    Query: {
        getActivity: async (_root, args, context) => {
            if (args.ooS) checkIfCan('nlu-data:r', getProjectIdFromModelId(args.modelId), context.user._id);
            else checkIfCan('incoming:r', getProjectIdFromModelId(args.modelId), context.user._id);
            const { cursor, pageSize } = args;
            const data = await getActivity(args);
            const cursorIndex = !cursor
                ? 0
                : data.findIndex(activity => activity._id === cursor) + 1;
            const activity = pageSize === 0
                ? data.slice(cursorIndex)
                : data.slice(cursorIndex, cursorIndex + pageSize);
        
            return {
                activity,
                pageInfo: {
                    endCursor: activity.length ? activity[activity.length - 1]._id : '',
                    hasNextPage: cursorIndex + pageSize < data.length,
                },
            };
        },
    },

    Mutation: {
        upsertActivity: async (_root, args, context) => {
            if (args.isOoS) checkIfCan('nlu-data:w', getProjectIdFromModelId(args.modelId), context.user._id);
            else checkIfCan('incoming:w', getProjectIdFromModelId(args.modelId), context.user._id);
            return upsertActivity(args);
        },
        deleteActivity: async (_root, args, context) => {
            if (args.isOoS) checkIfCan('nlu-data:w', getProjectIdFromModelId(args.modelId), context.user._id);
            else checkIfCan('incoming:w', getProjectIdFromModelId(args.modelId), context.user._id);
            return deleteActivity(args);
        },
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
        // eslint-disable-next-line camelcase
        conversation_id: ({ conversation_id }) => conversation_id,
        // eslint-disable-next-line camelcase
        message_id: ({ message_id }) => message_id,
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
