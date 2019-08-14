import { getConversationLengths } from '../analytics.conversation.lengths';

export default {
    Query: {
        async conversationLengths(parent, args, context, info) {
            return getConversationLengths(args.projectId, args.from, args.to);
        },
    },
    ConversationLengths: {
        length: (parent, args, context, info) => parent.length,
        frequency: (parent, args, context, info) => parent.frequency,
        count: (parent, args, context, info) => parent.count,
    },
};
