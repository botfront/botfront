import { getConversationsFunnel } from '../mongo/conversationsFunnel';

export default {
    Query: {
        async conversationsFunnel(parent, args, context) {
            return getConversationsFunnel(args);
        },
    },
    FunnelResults: {
      
        matchCount: (parent, args, context, info) => parent.matchCount,
        name: (parent, args, context, info) => parent.name,
        proportion: (parent, args, context, info) => parent.proportion,
    },
};
