import { getEntityDistribution } from '../mongo/nlu.analytics';

export default {
    Query: {
        async entityDistribution(parent, args, context, info) {
            return getEntityDistribution(args.modelId);
        },
    },
    EntityCount: {
        entity: (parent, args, context, info) => parent.entity,
        count: (parent, args, context, info) => parent.count,
        user: (parent, args, context, info) => context.user,
    },
};
