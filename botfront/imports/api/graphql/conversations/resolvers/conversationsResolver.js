/* eslint-disable no-unused-vars */
import {
    getConversations,
    getConversation,
    updateConversationStatus,
    deleteConversation,
    getIntents,
} from '../mongo/conversations';

export default {
    Query: {
        async conversationsPage(_, args, __) {
            return getConversations({ ...args });
        },
        async conversation(_, args, __) {
            return getConversation(args.projectId, args.id);
        },
        async intentsInConversations(_, args, __) {
            return getIntents(args.projectId);
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
    },
    Conversation: {
        latest_message: (parent, _, __) => parent.latest_message,
        events: (parent, _, __) => parent.events,
        sender_id: (parent, _, __) => parent.sender_id,
    },
    Message: {
        intent_ranking: (parent, _, __) => parent.intent_ranking,
        intent: (parent, _, __) => parent.intent,
        text: (parent, _, __) => parent.text,
        language: (parent, _, __) => parent.language,
        entities: (parent, _, __) => parent.entities,
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
    Event: {
        event: (parent, _, __) => parent.event,
        text: (parent, _, __) => parent.text,
        timestamp: (parent, _, __) => parent.timestamp,
        name: (parent, _, __) => parent.name,
        policy: (parent, _, __) => parent.policy,
        confidence: (parent, _, __) => parent.confidence,
        parse_data: (parent, _, __) => parent.parse_data,
        data: (parent, _, __) => parent.data,
        message_id: (parent, _, __) => parent.message_id,
    },
};
