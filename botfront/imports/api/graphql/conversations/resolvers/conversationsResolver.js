import { getConversations, getConversation } from '../mongo/conversations';

export default {
    Query: {
        async conversations(parent, args, context, info) {
            return getConversations(args.projectId, args.skip, args.limit, args.status, args.sort);
        },
        async conversation(parent, args, context, info) {
            return getConversation(args.projectId, args.id);
        },
    },
    ConversationContainer: {
        projectId: (parent, args, context, info) => parent.projectId,
        tracker: (parent, args, context, info) => parent.tracker,
        status: (parent, args, context, info) => parent.status,
        _id: (parent, args, context, info) => parent._id,
        updatedAt: (parent, args, context, info) => parent.updatedAt,
    },
    Conversation: {
        latest_message: (parent, args, context, info) => parent.latest_message,
        events: (parent, args, context, info) => parent.events,
        sender_id: (parent, args, context, info) => parent.sender_id,
    },
    Message: {
        intent_ranking: (parent, args, context, info) => parent.intent_ranking,
        intent: (parent, args, context, info) => parent.intent,
        text: (parent, args, context, info) => parent.text,
        language: (parent, args, context, info) => parent.language,
        entities: (parent, args, context, info) => parent.entities,
    },
    Entity: {
        entity: (parent, args, context, info) => parent.entity,
        value: (parent, args, context, info) => parent.value,
        start: (parent, args, context, info) => parent.start,
        end: (parent, args, context, info) => parent.end,
    },
    Intent: {
        confidence: (parent, args, context, info) => parent.confidence,
        name: (parent, args, context, info) => parent.name,
    },
    Event: {
        event: (parent, args, context, info) => parent.event,
        text: (parent, args, context, info) => parent.text,
        timestamp: (parent, args, context, info) => parent.timestamp,
        name: (parent, args, context, info) => parent.name,
        policy: (parent, args, context, info) => parent.policy,
        confidence: (parent, args, context, info) => parent.confidence,
        parse_data: (parent, args, context, info) => parent.parse_data,
        data: (parent, args, context, info) => parent.event,
    },
    Data: {
        elements: (parent, args, context, info) => parent.elements, 
        quick_replies: (parent, args, context, info) => parent.quick_replies, 
        buttons: (parent, args, context, info) => parent.buttons, 
        attachment: (parent, args, context, info) => parent.attachment, 
        image: (parent, args, context, info) => parent.image, 
        custom: (parent, args, context, info) => parent.custom, 
    }
};
