import { getIntentDistribution } from '../nlu.analytics';

export default {
    Query: {
        async intentDistribution(parent, args, context, info) {
            return getIntentDistribution(args.modelId);
            // return find(authors, { id: args.id });
        },
    },
    IntentCount: {
        intent: (parent, args, context, info) => parent.intent,
        count: (parent, args, context, info) => parent.count,
        user: (parent, args, context, info) => context.user,
    },
};