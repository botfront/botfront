/* eslint-disable no-underscore-dangle */
import { getIntentsFrequencies } from './queries/analytics.intents.frequencies';
import { checkIfCan } from '../../../lib/scopes';

export default {
    Query: {
        async intentsFrequencies(parent, args, context, info) {
            checkIfCan('analytics:r', args.projectId, context.user._id);
            return getIntentsFrequencies(args.projectId, args.from, args.to, args.position);
        },
    },
    IntentFrequency: {
        name: (parent, args, context, info) => parent.name,
        frequency: (parent, args, context, info) => parent.frequency,
        count: (parent, args, context, info) => parent.count,
    },

};
