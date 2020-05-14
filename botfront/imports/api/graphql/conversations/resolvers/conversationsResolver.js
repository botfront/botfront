/* eslint-disable no-unused-vars */
import {
    getConversations,
    getConversation,
    updateConversationStatus,
    deleteConversation,
} from '../mongo/conversations';

export default {
    Query: {
        async conversationsPage(_, args, __) {
            return getConversations(args.projectId, args.page, args.pageSize, args.status, args.sort);
        },
        async conversation(_, args, __) {
            return getConversation(args.projectId, args.id);
        },
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
