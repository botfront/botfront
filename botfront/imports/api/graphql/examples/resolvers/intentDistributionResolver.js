import { getIntentDistribution } from '../mongo/nlu.analytics';
import { checkIfCan } from '../../../../lib/scopes';

export default {
    Query: {
        async intentDistribution(parent, args, context, info) {
            checkIfCan('analytics:r', args.projectId, context.user._id);
            return getIntentDistribution(args.modelId);
        },
    },
    IntentCount: {
        intent: (parent, args, context, info) => parent.intent,
        count: (parent, args, context, info) => parent.count,
        user: (parent, args, context, info) => context.user,
    },
};
