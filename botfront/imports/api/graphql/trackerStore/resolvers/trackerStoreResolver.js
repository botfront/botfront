/* eslint-disable no-unused-vars */
import {
    getTracker,
    insertTrackerStore,
    updateTrackerStore,
} from '../mongo/trackerStore';

export default {
    Query: {
        async trackerStore(_, args, __) {
            return getTracker(args.senderId, args.projectId, args.after, args.maxEvents);
        },
    },
    Mutation: {
        async insertTrackerStore(_, args, __) {
            const response = await insertTrackerStore(args.senderId, args.projectId, args.tracker);
            return { success: response.ok === 1 };
        },
        async updateTrackerStore(_, args, __) {
            const response = await updateTrackerStore(args.senderId, args.projectId, args.tracker);
            return { success: response.ok === 1 };
        },
    },
    trackerStoreInfo: {
        tracker: (parent, _, __) => parent.tracker,
        lastIndex: (parent, _, __) => parent.trackerLen,
        lastTimestamp: (parent, _, __) => parent.lastTimeStamp,
    },
};
