import { getIntentDistribution } from '../mongo/nlu.analytics';

export default {
    Query: {
        async intentDistribution(parent, args, context, info) {
            return getIntentDistribution(args.modelId);
        },
    },
    IntentCount: {
        intent: (parent, args, context, info) => parent.intent,
        count: (parent, args, context, info) => parent.count,
        user: (parent, args, context, info) => context.user,
    },
};