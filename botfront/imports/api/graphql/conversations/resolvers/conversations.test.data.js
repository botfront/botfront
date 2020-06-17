export const conversationTemplate = {
    _id: '839676060a2f44b18724e12c9827c9bf',
    tracker: {
        sender_id: '839676060a2f44b18724e12c9827c9bf',
        slots: {
            disambiguation_message: null,
            fallback_language: 'en',
        },
        latest_message: {
            text: '/get_started',
            intent: {
                name: 'get_started',
                confidence: 1,
            },
            intent_ranking: [
                {
                    name: 'get_started',
                    confidence: 1,
                },
            ],
            entities: [],
        },
        latest_event_time: 1589481114.9532266,
        followup_action: null,
        paused: false,
        events: [
            {
                event: 'action',
                timestamp: 1589481114.9185326,
                name: 'action_listen',
            },
            {
                event: 'user',
                timestamp: 1589481114.9201195,
                metadata: {
                    language: 'en',
                },
                text: '/get_started',
                parse_data: {
                    text: '/get_started',
                    intent: {
                        name: 'get_started',
                        confidence: 1,
                    },
                    intent_ranking: [
                        {
                            name: 'get_started',
                            confidence: 1,
                        },
                    ],
                    entities: [],
                },
                input_channel: 'webchat',
                message_id: '9d488a3eaa5f4fc3bc5e8ba808d041b0',
            },
            {
                event: 'action',
                timestamp: 1589481114.9470503,
                name: 'utter_get_started',
            },
            {
                event: 'bot',
                timestamp: 1589481114.9471395,
                metadata: {},
                text: 'utter_get_started',
            },
            {
                event: 'action',
                timestamp: 1589481114.9532266,
                name: 'action_listen',
            },
        ],
        latest_input_channel: 'webchat',
        latest_action_name: 'action_listen',
        active_form: {},
    },
    status: 'read',
    projectId: 'bf',
    createdAt: '2020-05-14T18:31:54.895Z',
    updatedAt: '2020-05-14T18:32:07.096Z',
    actions: [
        'action_listen',
        'utter_get_started',
    ],
    intents: [
        'get_started',
    ],
    language: 'en',
    userId: null,
};
