import { getEntityDistribution } from '../mongo/nlu.analytics';
import { checkIfCan } from '../../../../lib/scopes';

export default {
    Query: {
        async entityDistribution(parent, args, context, info) {
            checkIfCan('analytics:r', args.projectId, context.user.id);
            return getEntityDistribution(args.modelId);
        },
    },
    EntityCount: {
        entity: (parent, args, context, info) => parent.entity,
        count: (parent, args, context, info) => parent.count,
        user: (parent, args, context, info) => context.user,
    },
};
