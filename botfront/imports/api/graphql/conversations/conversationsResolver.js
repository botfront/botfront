import { getConversations } from './conversations';

export default {
    Query: {
        async getConversations(parent, args, context, info) {
            return getConversations(args.projectId, args.page, args.limit);
        },
    },
    ConversationContainer: {
        projectId: (parent, args, context, info) => parent.projectId,
        tracker: (parent, args, context, info) => parent.tracker,
    },
};
