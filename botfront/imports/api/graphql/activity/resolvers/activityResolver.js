import {
    getActivity,
    upsertActivity,
    deleteActivity,
} from '../mongo/activity';

export default {
    Query: {
        getActivity: async (_root, args) => {
            const { cursor, pageSize } = args;
            const data = await getActivity(args);
            const cursorIndex = !cursor
                ? 0
                : data.findIndex(activity => activity._id === cursor) + 1;
            const activity = pageSize === 0
                ? data
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
        upsertActivity: async (_root, args) => upsertActivity(args),
        deleteActivity: async (_root, args) => deleteActivity(args),
    },

    Activity: {
        _id: ({ _id }) => _id,
        projectId: ({ projectId }) => projectId,
        language: ({ language }) => language,
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
