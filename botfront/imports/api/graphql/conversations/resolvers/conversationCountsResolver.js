import { getConversationCounts } from '../mongo/conversationCounts';
import { checkIfCan } from '../../../../lib/scopes';

export default {
    Query: {
        async conversationCounts(parent, args, context) {
            checkIfCan('analytics:r', args.projectId, context.user._id);
            if (!args.projectId) throw new Error('ProjectId is required');
            return getConversationCounts(args);
        },
    },
    ConversationCount: {
        bucket: (parent, args, context, info) => parent.bucket,
        count: (parent, args, context, info) => parent.count,
        hits: (parent, args, context, info) => parent.hits,
        proportion: (parent, args, context, info) => parent.proportion,
    },

};
