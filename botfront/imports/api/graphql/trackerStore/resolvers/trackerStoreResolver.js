/* eslint-disable no-unused-vars */
import {
    getTracker,
    upsertTrackerStore,
} from '../mongo/trackerStore';

export default {
    Query: {
        async trackerStore(_, args, __) {
            return getTracker(args.senderId, args.projectId, args.after, args.maxEvents);
        },
    },
    Mutation: {
        async insertTrackerStore(_, args, __) {
            const response = await upsertTrackerStore(args);
            return response;
        },
        async updateTrackerStore(_, args, __) {
            const response = await upsertTrackerStore(args);
            return response;
        },
    },
    trackerStoreInfo: {
        tracker: (parent, _, __) => parent.tracker,
        lastIndex: (parent, _, __) => parent.trackerLen,
        lastTimestamp: (parent, _, __) => parent.lastTimeStamp,
    },
};
