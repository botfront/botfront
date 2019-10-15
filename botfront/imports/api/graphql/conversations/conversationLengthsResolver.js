import { getConversationLengths } from './queries/analytics.conversation.lengths';
import { checkIfCan } from '../../../lib/scopes';

export default {
    Query: {
        async conversationLengths(parent, args, context, info) {
            // checkIfCan('analytics:r', args.projectId, context.user._id);
            return getConversationLengths(args.projectId, args.from, args.to);
        },
    },
    ConversationLengths: {
        length: (parent, args, context, info) => parent.length,
        frequency: (parent, args, context, info) => parent.frequency,
        count: (parent, args, context, info) => parent.count,
    },
};
