export const testConversation = {
    _id: 'testid',
    env: 'development',
    tracker: {
        sender_id: 'one',
        slots: {
            one: 'one',
        },
        latest_message: {
            text: 'one',
            intent: {
                name: 'one',
                confidence: 1,
            },
            intent_ranking: [
                {
                    name: 'one',
                    confidence: 1,
                },
            ],
            entities: [],
        },
        latest_event_time: 1568139001,
        followup_action: null,
        paused: false,
        events: [
            {
                event: 'action',
                timestamp: 1568139001,
                name: 'action_listen',
                policy: null,
                confidence: null,
            },
            {
                event: 'user',
                timestamp: 1568139001,
                text: 'one',
                parse_data: {
                    text: 'one',
                    intent: {
                        name: 'one',
                        confidence: 1,
                    },
                    intent_ranking: [
                        {
                            name: 'one',
                            confidence: 1,
                        },
                    ],
                    entities: [],
                },
                input_channel: 'webchat',
                message_id: 'one',
                metadata: null,
            },
            {
                event: 'action',
                timestamp: 1568139001,
                name: 'utter_get_started',
                policy: 'policy_1_MemoizationPolicy',
                confidence: 1,
            },
            {
                event: 'bot',
                timestamp: 1568139001,
                text: 'one',
                data: {
                    elements: null,
                    quick_replies: null,
                    buttons: null,
                    attachment: null,
                    image: null,
                    custom: null,
                },
            },
            {
                event: 'action',
                timestamp: 1568139001,
                name: 'action_listen',
                policy: 'one',
                confidence: 1,
            },
        ],
        latest_input_channel: 'webchat',
        latest_action_name: 'action_listen',
    },
    status: 'one',
    projectId: 'bf',
    createdAt: '2019-09-10T18:10:08.431Z',
    updatedAt: '2019-09-10T18:10:08.431Z',
};

export const testConversationEq = {
    _id: 'testid',
    trackerLen: 5,
    lastTimeStamp: 1568139001,
    tracker: {
        sender_id: 'one',
        slots: {
            one: 'one',
        },
        latest_message: {
            text: 'one',
            intent: {
                name: 'one',
                confidence: 1,
            },
            intent_ranking: [
                {
                    name: 'one',
                    confidence: 1,
                },
            ],
            entities: [],
        },
        latest_event_time: 1568139001,
        followup_action: null,
       
        events: [
            {
                event: 'action',
                timestamp: 1568139001,
                name: 'action_listen',
                policy: null,
                confidence: null,
            },
            {
                event: 'user',
                timestamp: 1568139001,
                text: 'one',
                parse_data: {
                    text: 'one',
                    intent: {
                        name: 'one',
                        confidence: 1,
                    },
                    intent_ranking: [
                        {
                            name: 'one',
                            confidence: 1,
                        },
                    ],
                    entities: [],
                },
                input_channel: 'webchat',
                message_id: 'one',
                metadata: null,
            },
            {
                event: 'action',
                timestamp: 1568139001,
                name: 'utter_get_started',
                policy: 'policy_1_MemoizationPolicy',
                confidence: 1,
            },
            {
                event: 'bot',
                timestamp: 1568139001,
                text: 'one',
                data: {
                    elements: null,
                    quick_replies: null,
                    buttons: null,
                    attachment: null,
                    image: null,
                    custom: null,
                },
            },
            {
                event: 'action',
                timestamp: 1568139001,
                name: 'action_listen',
                policy: 'one',
                confidence: 1,
            },
        ],
        latest_input_channel: 'webchat',
        latest_action_name: 'action_listen',
    },
};


export const testConversationEqSlice = {
    _id: 'testid',
    trackerLen: 5,
    lastTimeStamp: 1568139001,
    tracker: {
        sender_id: 'one',
        slots: {
            one: 'one',
        },
        latest_message: {
            text: 'one',
            intent: {
                name: 'one',
                confidence: 1,
            },
            intent_ranking: [
                {
                    name: 'one',
                    confidence: 1,
                },
            ],
            entities: [],
        },
        latest_event_time: 1568139001,
        followup_action: null,
       
        events: [
          
            {
                event: 'action',
                timestamp: 1568139001,
                name: 'utter_get_started',
                policy: 'policy_1_MemoizationPolicy',
                confidence: 1,
            },
            {
                event: 'bot',
                timestamp: 1568139001,
                text: 'one',
                data: {
                    elements: null,
                    quick_replies: null,
                    buttons: null,
                    attachment: null,
                    image: null,
                    custom: null,
                },
            },
            {
                event: 'action',
                timestamp: 1568139001,
                name: 'action_listen',
                policy: 'one',
                confidence: 1,
            },
        ],
        latest_input_channel: 'webchat',
        latest_action_name: 'action_listen',
    },
};


export const newTracker = {
    sender_id: 'one',
    slots: {
        one: 'one',
    },
    latest_message: {
        text: 'one',
        intent: {
            name: 'one',
            confidence: 1,
        },
        intent_ranking: [
            {
                name: 'one',
                confidence: 1,
            },
        ],
        entities: [],
    },
    latest_event_time: 1568139001,
    followup_action: null,
    paused: false,
    events: [
        {
            event: 'action',
            timestamp: 1568139008,
            name: 'action_listen',
            policy: null,
            confidence: null,
        },
        {
            event: 'user',
            timestamp: 1568139008,
            text: 'one',
            parse_data: {
                text: 'one',
                intent: {
                    name: 'one',
                    confidence: 1,
                },
                intent_ranking: [
                    {
                        name: 'one',
                        confidence: 1,
                    },
                ],
                entities: [],
            },
            input_channel: 'webchat',
            message_id: 'one',
            metadata: null,
        },
        {
            event: 'action',
            timestamp: 1568139008,
            name: 'utter_get_started',
            policy: 'policy_1_MemoizationPolicy',
            confidence: 1,
        },
        {
            event: 'bot',
            timestamp: 1568139008,
            text: 'one',
            data: {
                elements: null,
                quick_replies: null,
                buttons: null,
                attachment: null,
                image: null,
                custom: null,
            },
        },
        {
            event: 'action',
            timestamp: 1568139008,
            name: 'action_listen',
            policy: 'one',
            confidence: 1,
        },
    ],
    latest_input_channel: 'webchat',
    latest_action_name: 'action_listen',
    
   
};

export const newTrackerEq = {
    _id: 'new',
    actions: [
        'action_listen',
        'utter_get_started',
    ],
    intents: [
        'one',
    ],
    tracker: {
        sender_id: 'one',
        slots: {
            one: 'one',
        },
        latest_message: {
            text: 'one',
            intent: {
                name: 'one',
                confidence: 1,
            },
            intent_ranking: [
                {
                    name: 'one',
                    confidence: 1,
                },
            ],
            entities: [],
        },
        latest_event_time: 1568139001,
        followup_action: null,
        paused: false,
        events: [
            {
                event: 'action',
                timestamp: 1568139008,
                name: 'action_listen',
                policy: null,
                confidence: null,
            },
            {
                event: 'user',
                timestamp: 1568139008,
                text: 'one',
                parse_data: {
                    text: 'one',
                    intent: {
                        name: 'one',
                        confidence: 1,
                    },
                    intent_ranking: [
                        {
                            name: 'one',
                            confidence: 1,
                        },
                    ],
                    entities: [],
                },
                input_channel: 'webchat',
                message_id: 'one',
                metadata: null,
            },
            {
                event: 'action',
                timestamp: 1568139008,
                name: 'utter_get_started',
                policy: 'policy_1_MemoizationPolicy',
                confidence: 1,
            },
            {
                event: 'bot',
                timestamp: 1568139008,
                text: 'one',
                data: {
                    elements: null,
                    quick_replies: null,
                    buttons: null,
                    attachment: null,
                    image: null,
                    custom: null,
                },
            },
            {
                event: 'action',
                timestamp: 1568139008,
                name: 'action_listen',
                policy: 'one',
                confidence: 1,
            },
        ],
        latest_input_channel: 'webchat',
        latest_action_name: 'action_listen',
    },
    __v: 0,
    env: 'development',
    status: 'new',
    projectId: 'bf',
    createdAt: new Date('2019-09-10T18:10:08.000Z'),
    // updatedAt: new Date(), not checked in this object since it may varies
};


export const updateTrackerEq = {
    _id: 'testid',
    actions: [
        'action_listen',
        'utter_get_started',
    ],
    intents: [
        'one',
    ],
    tracker: {
        sender_id: 'one',
        slots: {
            one: 'one',
        },
        latest_message: {
            text: 'one',
            intent: {
                name: 'one',
                confidence: 1,
            },
            intent_ranking: [
                {
                    name: 'one',
                    confidence: 1,
                },
            ],
            entities: [],
        },
        latest_event_time: 1568139001,
        followup_action: null,
        paused: false,
        events: [
            {
                event: 'action',
                timestamp: 1568139001,
                name: 'action_listen',
                policy: null,
                confidence: null,
            },
            {
                event: 'user',
                timestamp: 1568139001,
                text: 'one',
                parse_data: {
                    text: 'one',
                    intent: {
                        name: 'one',
                        confidence: 1,
                    },
                    intent_ranking: [
                        {
                            name: 'one',
                            confidence: 1,
                        },
                    ],
                    entities: [],
                },
                input_channel: 'webchat',
                message_id: 'one',
                metadata: null,
            },
            {
                event: 'action',
                timestamp: 1568139001,
                name: 'utter_get_started',
                policy: 'policy_1_MemoizationPolicy',
                confidence: 1,
            },
            {
                event: 'bot',
                timestamp: 1568139001,
                text: 'one',
                data: {
                    elements: null,
                    quick_replies: null,
                    buttons: null,
                    attachment: null,
                    image: null,
                    custom: null,
                },
            },
            {
                event: 'action',
                timestamp: 1568139001,
                name: 'action_listen',
                policy: 'one',
                confidence: 1,
            }, {
                event: 'action',
                timestamp: 1568139008,
                name: 'action_listen',
                policy: null,
                confidence: null,
            },
            {
                event: 'user',
                timestamp: 1568139008,
                text: 'one',
                parse_data: {
                    text: 'one',
                    intent: {
                        name: 'one',
                        confidence: 1,
                    },
                    intent_ranking: [
                        {
                            name: 'one',
                            confidence: 1,
                        },
                    ],
                    entities: [],
                },
                input_channel: 'webchat',
                message_id: 'one',
                metadata: null,
            },
            {
                event: 'action',
                timestamp: 1568139008,
                name: 'utter_get_started',
                policy: 'policy_1_MemoizationPolicy',
                confidence: 1,
            },
            {
                event: 'bot',
                timestamp: 1568139008,
                text: 'one',
                data: {
                    elements: null,
                    quick_replies: null,
                    buttons: null,
                    attachment: null,
                    image: null,
                    custom: null,
                },
            },
            {
                event: 'action',
                timestamp: 1568139008,
                name: 'action_listen',
                policy: 'one',
                confidence: 1,
            },
        ],
        latest_input_channel: 'webchat',
        latest_action_name: 'action_listen',
    },
    __v: 0,
    status: 'one',
    projectId: 'bf',
    createdAt: '2019-09-10T18:10:08.431Z',
    env: 'development',
    // updatedAt: new Date(), not checked in this object since it may varies
};
