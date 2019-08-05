import { getEntityDistribution } from '../nlu.analytics';

export default {
    Query: {
        async entityDistribution(parent, args, context, info) {
            return getEntityDistribution(args.modelId);
            // return find(authors, { id: args.id });
        },
    },
    EntityCount: {
        entity: (parent, args, context, info) => parent.entity,
        count: (parent, args, context, info) => parent.count,
        user: (parent, args, context, info) => context.user,
    },
};
