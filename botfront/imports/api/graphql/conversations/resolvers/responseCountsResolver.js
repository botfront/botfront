import { getResponseCounts } from '../queries/responseCounts';
import { checkIfCan } from '../../../../lib/scopes';

export default {
    Query: {
        async responseCounts(parent, args, context, info) {
            if (!args.projectId) throw new Error('ProjectId is required');
            if (context.user) checkIfCan('analytics:r', args.projectId, context.user._id);
            return getResponseCounts(args);
        },
    },
    ResponseCount: {
        bucket: (parent, args, context, info) => parent.bucket,
        count: (parent, args, context, info) => parent.count,
        total: (parent, args, context, info) => parent.total,
        proportion: (parent, args, context, info) => parent.proportion,
    },

};
