import { getConversations } from '../mongo/conversations';

export default {
    Query: {
        async conversations(parent, args, context, info) {
            return getConversations(args.projectId, args.page, args.limit, args.status, args.sort);
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
        timestamp: (parent, args, context, info) => parent.timestamp,
        name: (parent, args, context, info) => parent.name,
        policy: (parent, args, context, info) => parent.policy,
        confidence: (parent, args, context, info) => parent.confidence,
        parse_data: (parent, args, context, info) => parent.parse_data,
    },
};
