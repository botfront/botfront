import { getConversationCounts } from '../mongo/conversationCounts';
import { checkIfCan } from '../../../../lib/scopes';

export default {
    Query: {
        async conversationCounts(parent, args, context, info) {
            if (!args.projectId) throw new Error('ProjectId is required');
            if (context.user) checkIfCan('analytics:r', args.projectId, context.user._id);
            return getConversationCounts(args);
        },
    },
    ConversationCount: {
        bucket: (parent, args, context, info) => parent.bucket,
        count: (parent, args, context, info) => parent.count,
        engagements: (parent, args, context, info) => parent.engagements,
        proportion: (parent, args, context, info) => parent.proportion,
    },

};
