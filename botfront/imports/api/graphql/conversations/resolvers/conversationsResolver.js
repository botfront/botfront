/* eslint-disable no-unused-vars */
import {
    getConversations,
    getConversation,
    updateConversationStatus,
    deleteConversation,
    getIntents,
} from '../mongo/conversations';
import { checkIfCan } from '../../../../lib/scopes';
import { auditLog } from '../../../../../server/logger';
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
        async conversationsPage(_, args, context) {
            checkIfCan('incoming:r', args.projectId, context.user._id);
            return getConversations({ ...args });
        },
        async conversation(_, args, context) {
            checkIfCan('incoming:r', args.projectId, context.user._id);
            return getConversation(args.projectId, args.id, args.senderId);
        },
        async intentsInConversations(_, args, context) {
            checkIfCan('incoming:r', args.projectId, context.user._id);
            return getIntents(args.projectId);
        },
        latestImportedEvent: async (_, args, __) => getLatestTimestamp(args.projectId, args.environment),
    },
    Mutation: {
        async markAsRead(_, args, context) {
            checkIfCan('incoming:r', args.projectId, context.user._id);
            const response = await updateConversationStatus(args.id, 'read');
            return { success: response.ok === 1 };
        },
        async updateStatus(_, args, context) {
            checkIfCan('incoming:w', args.projectId, context.user._id);
            const conversationBefore = await getConversation(args.projectId, args.id);
            const response = await updateConversationStatus(args.id, args.status);
            const conversationAfter = await getConversation(args.projectId, args.id);
            auditLog('Updated conversation status', {
                userId: context.user,
                type: 'updated',
                projectId: args.projectId,
                operation: 'conversation-updated',
                resId: args.id,
                after: { conversation: conversationAfter },
                before: { conversation: conversationBefore },
                resType: 'conversation',
            });
            return { success: response.ok === 1 };
        },
        async delete(_, args, context) {
            checkIfCan('incoming:w', args.projectId, context.user._id);
            const conversationBefore = await getConversation(args.projectId, args.id);
            const response = await deleteConversation(args.id);
            auditLog('Deleted conversation ', {
                userId: context.user,
                type: 'deleted',
                operation: 'conversation-deleted',
                projectId: args.projectId,
                resId: args.id,
                before: { conversation: conversationBefore },
                resType: 'conversation',
            });
            return { success: response.ok === 1 };
        },
        importConversations: async (_, args, __) => {
            const {
                conversations, projectId, environment, importConversationsOnly,
            } = args;
            const latestTimestamp = await getLatestTimestamp(projectId, environment);
            const results = await Promise.all(conversations
                .filter(c => c.tracker.latest_event_time >= latestTimestamp)
                .map(c => upsertTrackerStore({
                    senderId: c.tracker.sender_id || c._id,
                    projectId,
                    env: environment,
                    tracker: c.tracker,
                    overwriteEvents: true,
                    importConversationsOnly,
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
