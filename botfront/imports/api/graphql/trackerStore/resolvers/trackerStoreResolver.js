/* eslint-disable no-unused-vars */
import {
    getTracker,
    insertEvent,
    updateEvent,
} from '../mongo/trackerStore';

export default {
    Query: {
        async trackerStore(_, args, __) {
            return getTracker(args.senderId, args.projectId, args.after, args.maxEvents);
        },
    },
    Mutation: {
        async insertEvent(_, args, __) {
            const response = await insertEvent(args.senderId, args.projectId, args.event);
            return { success: response.ok === 1 };
        },
        async updateEvent(_, args, __) {
            const response = await updateEvent(args.senderId, args.projectId, args.event);
            return { success: response.ok === 1 };
        },
    },
};
