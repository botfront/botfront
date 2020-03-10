import { getIntentFrequencies } from '../mongo/intentFrequencies';
import { checkIfCan } from '../../../../lib/scopes';

export default {
    Query: {
        async intentFrequencies(parent, args, context, info) {
            checkIfCan('analytics:r', args.projectId, context.user._id);
            if (!args.projectId) throw new Error('ProjectId is required');
            return getIntentFrequencies(args);
        },
    },
    IntentFrequency: {
        name: (parent, args, context, info) => parent.name,
        frequency: (parent, args, context, info) => parent.frequency,
        count: (parent, args, context, info) => parent.count,
    },

};
