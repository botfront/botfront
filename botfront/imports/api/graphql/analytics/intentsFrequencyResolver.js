/* eslint-disable no-underscore-dangle */
import { getIntentsFrequencies } from '../analytics.intents.frequencies';

export default {
    Query: {
        async intentsFrequencies(parent, args, context, info) {
            return getIntentsFrequencies(args.projectId, args.from, args.to, args.position);
        },
    },
    IntentFrequency: {
        name: (parent, args, context, info) => parent.name,
        frequency: (parent, args, context, info) => parent.frequency,
        count: (parent, args, context, info) => parent.count,
    },

};
