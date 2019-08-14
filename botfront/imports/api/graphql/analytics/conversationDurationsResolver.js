/* eslint-disable no-underscore-dangle */
import { getConversationDurations } from '../analytics.conversation.durations';

export default {
    Query: {
        async conversationDurations(parent, args, context, info) {
            return getConversationDurations(args.projectId, args.from, args.to);
        },
    },
    ConversationDurations: {
        _30: (parent, args, context, info) => parent._30,
        _30_60: (parent, args, context, info) => parent._30_60,
        _60_90: (parent, args, context, info) => parent._60_90,
        _90_120: (parent, args, context, info) => parent._90_120,
        _120_180: (parent, args, context, info) => parent._120_180,
        _180_: (parent, args, context, info) => parent._180_,
    },
};
