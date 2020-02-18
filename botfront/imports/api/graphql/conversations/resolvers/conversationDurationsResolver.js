import { getConversationDurations } from '../mongo/conversationDurations';
import { checkIfCan } from '../../../../lib/scopes';

export default {
    Query: {
        async conversationDurations(parent, args, context) {
            checkIfCan('analytics:r', args.projectId, context.user._id);
            if (!args.projectId) throw new Error('ProjectId is required');
            return getConversationDurations(args);
        },
    },
    ConversationDuration: {
        duration: (parent, args, context, info) => parent.duration,
        frequency: (parent, args, context, info) => parent.frequency,
        count: (parent, args, context, info) => parent.count,
    },
};
