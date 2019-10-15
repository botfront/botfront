import { getConversationLengths } from '../queries/conversationLengths';
import { checkIfCan } from '../../../../lib/scopes';

export default {
    Query: {
        async conversationLengths(parent, args, context, info) {
            if (!args.projectId) throw new Error('ProjectId is required');
            // checkIfCan('analytics:r', args.projectId, context.user._id);
            return getConversationLengths(args);
        },
    },
    ConversationLengths: {
        length: (parent, args, context, info) => parent.length,
        frequency: (parent, args, context, info) => parent.frequency,
        count: (parent, args, context, info) => parent.count,
    },
};
