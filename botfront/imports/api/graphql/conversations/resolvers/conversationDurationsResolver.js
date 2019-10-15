import { getConversationDurations } from '../queries/conversationDurations';
import { checkIfCan } from '../../../../lib/scopes';

export default {
    Query: {
        async conversationDurations(parent, args, context, info) {
            // checkIfCan('analytics:r', args.projectId, context.user._id);
            return getConversationDurations(args.projectId, args.from, args.to);
        },
    },
    ConversationDurations: {
        duration: (parent, args, context, info) => parent.duration,
        frequency: (parent, args, context, info) => parent.frequency,
        count: (parent, args, context, info) => parent.count,
    },
};
