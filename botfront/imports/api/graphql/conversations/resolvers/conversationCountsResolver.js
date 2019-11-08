import { getConversationsIncludingAction } from '../mongo/conversationsIncludingAction';
import { getConversationsWithEngagement } from '../mongo/conversationsWithEngagement';
import { checkIfCan } from '../../../../lib/scopes';

export default {
    Query: {
        async conversationCounts(parent, args, context, info) {
            if (!args.projectId) throw new Error('ProjectId is required');
            if (context.user) checkIfCan('analytics:r', args.projectId, context.user._id);
            let aggr;
            switch (args.subtype) {
            case 'engagement': aggr = getConversationsWithEngagement; break;
            case 'fallback': aggr = getConversationsIncludingAction; break;
            default: throw new Error('Subtype is required');
            }
            return aggr(args);
        },
    },
    ConversationCount: {
        bucket: (parent, args, context, info) => parent.bucket,
        count: (parent, args, context, info) => parent.count,
        hits: (parent, args, context, info) => parent.hits,
        proportion: (parent, args, context, info) => parent.proportion,
    },

};
