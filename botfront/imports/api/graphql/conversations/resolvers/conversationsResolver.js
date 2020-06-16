/* eslint-disable no-unused-vars */
import {
    getConversations,
    getConversation,
    updateConversationStatus,
    deleteConversation,
} from '../mongo/conversations';
import Conversations from '../conversations.model.js';
import {
    upsertTrackerStore,
} from '../../trackerStore/mongo/trackerStore';

const getLatestTimestamp = async (projectId, environment) => {
    const query = !environment || environment === 'development'
        ? {
            $or: [
                { projectId, env: { $exists: false } },
                { projectId, env: 'development' },
            ],
        }
        : { projectId, env: environment };
    const latestAddition = await Conversations.findOne(query)
        .select('tracker.latest_event_time')
        .sort('-tracker.latest_event_time')
        .lean()
        .exec();
    return latestAddition
        ? latestAddition.tracker.latest_event_time : 0;
};

export default {
    Query: {
        async conversationsPage(_, args, __) {
            return getConversations(args.projectId, args.page, args.pageSize, args.status, args.sort);
        },
        async conversation(_, args, __) {
            return getConversation(args.projectId, args.id);
        },
        latestImportedEvent: async (_, args, __) => getLatestTimestamp(args.projectId, args.environment),
    },
    Mutation: {
        async markAsRead(_, args, __) {
            const response = await updateConversationStatus(args.id, 'read');
            return { success: response.ok === 1 };
        },
        async updateStatus(_, args, __) {
            const response = await updateConversationStatus(args.id, args.status);
            return { success: response.ok === 1 };
        },
        async delete(_, args, __) {
            const response = await deleteConversation(args.id);
            return { success: response.ok === 1 };
        },
        importConversations: async (_, args, __) => {
            const { conversations, projectId, environment } = args;
            const latestTimestamp = await getLatestTimestamp(projectId, environment);
            const results = await Promise.all(conversations
                .filter(c => c.tracker.latest_event_time >= latestTimestamp)
                .map(c => upsertTrackerStore({
                    senderId: c.tracker.sender_id || c._id,
                    projectId,
                    env: environment,
                    tracker: c.tracker,
                    overwriteEvents: true,
                })));
            const notInserted = results.filter(({ status }) => status !== 'inserted');
            const failed = notInserted.filter(({ status }) => status === 'failed')
                .map(({ _id }) => _id);
            const nTotal = conversations.length;
            const nPushed = results.length;
            const nInserted = nPushed - notInserted.length;
            const nUpdated = notInserted.length - failed.length;
            return {
                nTotal, nPushed, nInserted, nUpdated, failed,
            };
        },
    },

    Pagination: {
        conversations: (parent, _, __) => parent.conversations,
        pages: (parent, _, __) => parent.pages,
    },
    ConversationContainer: {
        projectId: (parent, _, __) => parent.projectId,
        tracker: (parent, _, __) => parent.tracker,
        status: (parent, _, __) => parent.status,
        _id: (parent, _, __) => parent._id,
        updatedAt: (parent, _, __) => parent.updatedAt,
        createdAt: (parent, _, __) => parent.createdAt,
        env: (parent, _, __) => parent.env,
        language: (parent, _, __) => parent.language,
    },
};
