import { getConversationsLength } from '../analytics.conversations.length';

export default {
    Query: {
        async conversationsLength(parent, args, context, info) {
            return getConversationsLength(args.projectId, args.from, args.to);
        },
    },
    ConversationsLength: {
        length: (parent, args, context, info) => parent.length,
        frequency: (parent, args, context, info) => parent.frequency,
        count: (parent, args, context, info) => parent.count,
    },
};
