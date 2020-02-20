/* eslint-disable no-unused-vars */
import {
    getConversations,
    getConversation,
    updateConversationStatus,
    deleteConversation,
    getIntents,
} from '../mongo/conversations';
import { checkIfCan } from '../../../../lib/scopes';

export default {
    Query: {
        async conversationsPage(_, args, context) {
            checkIfCan('incoming:r', args.projectId, context.user._id);
            return getConversations({ ...args });
        },
        async conversation(_, args, context) {
            checkIfCan('incoming:r', args.projectId, context.user._id);
            return getConversation(args.projectId, args.id);
        },
        async intentsInConversations(_, args, context) {
            checkIfCan('incoming:r', args.projectId, context.user._id);
            return getIntents(args.projectId);
        },
    },
    Mutation: {
        async markAsRead(_, args, context) {
            checkIfCan('incoming:r', args.projectId, context.user._id, { operationType: 'conversation-updated' });
            const response = await updateConversationStatus(args.id, 'read');
            return { success: response.ok === 1 };
        },
        async updateStatus(_, args, context) {
            checkIfCan('incoming:w', args.projectId, context.user._id, { operationType: 'conversation-updated' });
            const response = await updateConversationStatus(args.id, args.status);
            return { success: response.ok === 1 };
        },
        async delete(_, args, context) {
            checkIfCan('incoming:w', args.projectId, context.user._id, { operationType: 'conversation-deleted' });
            const response = await deleteConversation(args.id);
            return { success: response.ok === 1 };
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
    },
    Entity: {
        entity: (parent, _, __) => parent.entity,
        value: (parent, _, __) => parent.value,
        start: (parent, _, __) => parent.start,
        end: (parent, _, __) => parent.end,
    },
    Intent: {
        confidence: (parent, _, __) => parent.confidence,
        name: (parent, _, __) => parent.name,
    },
};
