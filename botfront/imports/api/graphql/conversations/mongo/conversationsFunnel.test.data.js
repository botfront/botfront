export default [
    {
        _id: 'accf2030214746c1ac8d42741bfd0a07',
        tracker: {
            sender_id: 'accf2030214746c1ac8d42741bfd0a07',
            slots: {
                disambiguation_message: null,
                fallback_language: 'en',
            },
            latest_message: {
                text: '/no',
                intent: {
                    name: 'no',
                    confidence: 1,
                },
                intent_ranking: [
                    {
                        name: 'no',
                        confidence: 1,
                    },
                ],
                entities: [],
            },
            latest_event_time: 1590503465.9218996,
            followup_action: null,
            paused: false,
            events: [
                {
                    event: 'action',
                    timestamp: 1590503449.9221,
                    name: 'action_session_start',
                    policy: null,
                    confidence: null,
                },
                {
                    event: 'session_started',
                    timestamp: 1590503449.9221203,
                },
                {
                    event: 'action',
                    timestamp: 1590503449.9221776,
                    name: 'action_listen',
                    policy: null,
                    confidence: null,
                },
                {
                    event: 'user',
                    timestamp: 1590503449.9233427,
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
                    message_id: 'b5566de2d7174f1d872d5a6fbdbdcc5c',
                },
                {
                    event: 'action',
                    timestamp: 1590503449.9718797,
                    name: 'action_default_fallback',
                    policy: 'policy_0_FallbackPolicy',
                    confidence: 0.3,
                },
                {
                    event: 'bot',
                    timestamp: 1590503449.9719055,
                    metadata: {
                        metadata: null,
                    },
                    text: 'utter_default',
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
                    event: 'rewind',
                    timestamp: 1590503449.9719245,
                },
                {
                    event: 'action',
                    timestamp: 1590503449.9799378,
                    name: 'action_listen',
                    policy: null,
                    confidence: 1,
                },
                {
                    event: 'user',
                    timestamp: 1590503456.8298938,
                    metadata: {
                        language: 'en',
                    },
                    text: '/hi',
                    parse_data: {
                        text: '/hi',
                        intent: {
                            name: 'hi',
                            confidence: 1,
                        },
                        intent_ranking: [
                            {
                                name: 'hi',
                                confidence: 1,
                            },
                        ],
                        entities: [],
                    },
                    input_channel: 'webchat',
                    message_id: '601ec75fc86e43539b9e615e5277e0df',
                },
                {
                    event: 'action',
                    timestamp: 1590503456.8556035,
                    name: 'utter_coffee',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'bot',
                    timestamp: 1590503456.8556213,
                    metadata: {
                        metadata: null,
                    },
                    text: 'utter_coffee',
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
                    timestamp: 1590503456.86053,
                    name: 'action_listen',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'user',
                    timestamp: 1590503458.9877129,
                    metadata: {
                        language: 'en',
                    },
                    text: '/yes',
                    parse_data: {
                        text: '/yes',
                        intent: {
                            name: 'yes',
                            confidence: 1,
                        },
                        intent_ranking: [
                            {
                                name: 'yes',
                                confidence: 1,
                            },
                        ],
                        entities: [],
                    },
                    input_channel: 'webchat',
                    message_id: '727ed4180cdc40e3a11c7367644a9084',
                },
                {
                    event: 'action',
                    timestamp: 1590503459.0208056,
                    name: 'utter_sugar',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'bot',
                    timestamp: 1590503459.0208225,
                    metadata: {
                        metadata: null,
                    },
                    text: 'utter_sugar',
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
                    timestamp: 1590503459.0271018,
                    name: 'action_listen',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'user',
                    timestamp: 1590503465.888617,
                    metadata: {
                        language: 'en',
                    },
                    text: '/no',
                    parse_data: {
                        text: '/no',
                        intent: {
                            name: 'no',
                            confidence: 1,
                        },
                        intent_ranking: [
                            {
                                name: 'no',
                                confidence: 1,
                            },
                        ],
                        entities: [],
                    },
                    input_channel: 'webchat',
                    message_id: '89212cb929af4d97a8ff5f86ac566f00',
                },
                {
                    event: 'action',
                    timestamp: 1590503465.9151068,
                    name: 'utter_oknosugar',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'bot',
                    timestamp: 1590503465.9151247,
                    metadata: {
                        metadata: null,
                    },
                    text: 'utter_oknosugar',
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
                    timestamp: 1590503465.9218996,
                    name: 'action_listen',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
            ],
            latest_input_channel: 'webchat',
            latest_action_name: 'action_listen',
            active_form: {},
        },
        status: 'new',
        projectId: 'bf',
        env: 'development',
        createdAt: '2020-05-26T14:30:49.870Z',
        updatedAt: '2020-05-26T14:31:05.905Z',
        __v: 0,
        actions: [
            'action_session_start',
            'action_listen',
            'action_default_fallback',
            'utter_coffee',
            'utter_sugar',
            'utter_oknosugar',
        ],
        intents: [
            'get_started',
            'hi',
            'yes',
            'no',
        ],
        language: 'en',
        userId: null,
    },
    {
        _id: 'ad99e8f2f07e4dd69f35fb2394a032da',
        tracker: {
            sender_id: 'ad99e8f2f07e4dd69f35fb2394a032da',
            slots: {
                disambiguation_message: null,
                fallback_language: 'en',
            },
            latest_message: {
                text: '/yes',
                intent: {
                    name: 'yes',
                    confidence: 1,
                },
                intent_ranking: [
                    {
                        name: 'yes',
                        confidence: 1,
                    },
                ],
                entities: [],
            },
            latest_event_time: 1590503476.7473423,
            followup_action: null,
            paused: false,
            events: [
                {
                    event: 'action',
                    timestamp: 1590503470.3878713,
                    name: 'action_session_start',
                    policy: null,
                    confidence: null,
                },
                {
                    event: 'session_started',
                    timestamp: 1590503470.387893,
                },
                {
                    event: 'action',
                    timestamp: 1590503470.387936,
                    name: 'action_listen',
                    policy: null,
                    confidence: null,
                },
                {
                    event: 'user',
                    timestamp: 1590503470.3891003,
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
                    message_id: '136b3141fb9d4cc8b857e1d4a809f369',
                },
                {
                    event: 'action',
                    timestamp: 1590503470.4190464,
                    name: 'action_default_fallback',
                    policy: 'policy_0_FallbackPolicy',
                    confidence: 0.3,
                },
                {
                    event: 'bot',
                    timestamp: 1590503470.4190695,
                    metadata: {
                        metadata: null,
                    },
                    text: 'utter_default',
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
                    event: 'rewind',
                    timestamp: 1590503470.4190953,
                },
                {
                    event: 'action',
                    timestamp: 1590503470.4233317,
                    name: 'action_listen',
                    policy: null,
                    confidence: 1,
                },
                {
                    event: 'user',
                    timestamp: 1590503472.6586807,
                    metadata: {
                        language: 'en',
                    },
                    text: '/hi',
                    parse_data: {
                        text: '/hi',
                        intent: {
                            name: 'hi',
                            confidence: 1,
                        },
                        intent_ranking: [
                            {
                                name: 'hi',
                                confidence: 1,
                            },
                        ],
                        entities: [],
                    },
                    input_channel: 'webchat',
                    message_id: '3569739a34324c35ae6e2c6f373729ae',
                },
                {
                    event: 'action',
                    timestamp: 1590503472.6890352,
                    name: 'utter_coffee',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'bot',
                    timestamp: 1590503472.6890528,
                    metadata: {
                        metadata: null,
                    },
                    text: 'utter_coffee',
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
                    timestamp: 1590503472.6936307,
                    name: 'action_listen',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'user',
                    timestamp: 1590503474.7110775,
                    metadata: {
                        language: 'en',
                    },
                    text: '/yes',
                    parse_data: {
                        text: '/yes',
                        intent: {
                            name: 'yes',
                            confidence: 1,
                        },
                        intent_ranking: [
                            {
                                name: 'yes',
                                confidence: 1,
                            },
                        ],
                        entities: [],
                    },
                    input_channel: 'webchat',
                    message_id: '867df15b74044a70823494100d986d3c',
                },
                {
                    event: 'action',
                    timestamp: 1590503474.7394614,
                    name: 'utter_sugar',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'bot',
                    timestamp: 1590503474.7394843,
                    metadata: {
                        metadata: null,
                    },
                    text: 'utter_sugar',
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
                    timestamp: 1590503474.7439368,
                    name: 'action_listen',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'user',
                    timestamp: 1590503476.7152107,
                    metadata: {
                        language: 'en',
                    },
                    text: '/yes',
                    parse_data: {
                        text: '/yes',
                        intent: {
                            name: 'yes',
                            confidence: 1,
                        },
                        intent_ranking: [
                            {
                                name: 'yes',
                                confidence: 1,
                            },
                        ],
                        entities: [],
                    },
                    input_channel: 'webchat',
                    message_id: '979bcb3527554b2197c540b4b8fdf355',
                },
                {
                    event: 'action',
                    timestamp: 1590503476.742571,
                    name: 'utter_ok',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'bot',
                    timestamp: 1590503476.7425888,
                    metadata: {
                        metadata: null,
                    },
                    text: 'utter_ok',
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
                    timestamp: 1590503476.7473423,
                    name: 'action_listen',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
            ],
            latest_input_channel: 'webchat',
            latest_action_name: 'action_listen',
            active_form: {},
        },
        status: 'new',
        projectId: 'bf',
        env: 'development',
        createdAt: '2020-05-26T14:31:10.344Z',
        updatedAt: '2020-05-26T14:31:16.758Z',
        __v: 0,
        actions: [
            'action_session_start',
            'action_listen',
            'action_default_fallback',
            'utter_coffee',
            'utter_sugar',
            'utter_ok',
        ],
        intents: [
            'get_started',
            'hi',
            'yes',
        ],
        language: 'en',
        userId: null,
    },
    {
        _id: '70e4e1fa57df4b0691ebc32562d1e327',
        tracker: {
            sender_id: '70e4e1fa57df4b0691ebc32562d1e327',
            slots: {
                disambiguation_message: null,
                fallback_language: 'en',
            },
            latest_message: {
                text: '/no',
                intent: {
                    name: 'no',
                    confidence: 1,
                },
                intent_ranking: [
                    {
                        name: 'no',
                        confidence: 1,
                    },
                ],
                entities: [],
            },
            latest_event_time: 1590503503.0042386,
            followup_action: null,
            paused: false,
            events: [
                {
                    event: 'action',
                    timestamp: 1590503479.7,
                    name: 'action_session_start',
                    policy: null,
                    confidence: null,
                },
                {
                    event: 'session_started',
                    timestamp: 1590503479.7000175,
                },
                {
                    event: 'action',
                    timestamp: 1590503479.700312,
                    name: 'action_listen',
                    policy: null,
                    confidence: null,
                },
                {
                    event: 'user',
                    timestamp: 1590503479.701979,
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
                    message_id: '2637b4a6f1134dc78e36022ac92d342c',
                },
                {
                    event: 'action',
                    timestamp: 1590503479.7328777,
                    name: 'action_default_fallback',
                    policy: 'policy_0_FallbackPolicy',
                    confidence: 0.3,
                },
                {
                    event: 'bot',
                    timestamp: 1590503479.7328978,
                    metadata: {
                        metadata: null,
                    },
                    text: 'utter_default',
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
                    event: 'rewind',
                    timestamp: 1590503479.732906,
                },
                {
                    event: 'action',
                    timestamp: 1590503479.737803,
                    name: 'action_listen',
                    policy: null,
                    confidence: 1,
                },
                {
                    event: 'user',
                    timestamp: 1590503482.7757032,
                    metadata: {
                        language: 'en',
                    },
                    text: '/hi',
                    parse_data: {
                        text: '/hi',
                        intent: {
                            name: 'hi',
                            confidence: 1,
                        },
                        intent_ranking: [
                            {
                                name: 'hi',
                                confidence: 1,
                            },
                        ],
                        entities: [],
                    },
                    input_channel: 'webchat',
                    message_id: '026823fe3bd647dfbfa4287a8bd1be5e',
                },
                {
                    event: 'action',
                    timestamp: 1590503482.8051863,
                    name: 'utter_coffee',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'bot',
                    timestamp: 1590503482.805205,
                    metadata: {
                        metadata: null,
                    },
                    text: 'utter_coffee',
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
                    timestamp: 1590503482.8114667,
                    name: 'action_listen',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'user',
                    timestamp: 1590503485.2760136,
                    metadata: {
                        language: 'en',
                    },
                    text: '/no',
                    parse_data: {
                        text: '/no',
                        intent: {
                            name: 'no',
                            confidence: 1,
                        },
                        intent_ranking: [
                            {
                                name: 'no',
                                confidence: 1,
                            },
                        ],
                        entities: [],
                    },
                    input_channel: 'webchat',
                    message_id: '23f2f820d45044cf8e6193ac9c179385',
                },
                {
                    event: 'action',
                    timestamp: 1590503485.3042738,
                    name: 'utter_tea',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'bot',
                    timestamp: 1590503485.3042946,
                    metadata: {
                        metadata: null,
                    },
                    text: 'utter_tea',
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
                    timestamp: 1590503485.309028,
                    name: 'action_listen',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'user',
                    timestamp: 1590503489.827323,
                    metadata: {
                        language: 'en',
                    },
                    text: '/yes',
                    parse_data: {
                        text: '/yes',
                        intent: {
                            name: 'yes',
                            confidence: 1,
                        },
                        intent_ranking: [
                            {
                                name: 'yes',
                                confidence: 1,
                            },
                        ],
                        entities: [],
                    },
                    input_channel: 'webchat',
                    message_id: '9e61588f12434bae93f686f9b783ef38',
                },
                {
                    event: 'action',
                    timestamp: 1590503489.8527808,
                    name: 'utter_sugar',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'bot',
                    timestamp: 1590503489.852798,
                    metadata: {
                        metadata: null,
                    },
                    text: 'utter_sugar',
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
                    timestamp: 1590503489.858045,
                    name: 'action_listen',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'user',
                    timestamp: 1590503502.9556413,
                    metadata: {
                        language: 'en',
                    },
                    text: '/no',
                    parse_data: {
                        text: '/no',
                        intent: {
                            name: 'no',
                            confidence: 1,
                        },
                        intent_ranking: [
                            {
                                name: 'no',
                                confidence: 1,
                            },
                        ],
                        entities: [],
                    },
                    input_channel: 'webchat',
                    message_id: '6275e64058af4c79874c2b3920788695',
                },
                {
                    event: 'action',
                    timestamp: 1590503502.9971182,
                    name: 'utter_oknosugar',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
                {
                    event: 'bot',
                    timestamp: 1590503502.9971364,
                    metadata: {
                        metadata: null,
                    },
                    text: 'utter_oknosugar',
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
                    timestamp: 1590503503.0042386,
                    name: 'action_listen',
                    policy: 'policy_1_AugmentedMemoizationPolicy',
                    confidence: 1,
                },
            ],
            latest_input_channel: 'webchat',
            latest_action_name: 'action_listen',
            active_form: {},
        },
        status: 'read',
        projectId: 'bf',
        env: 'development',
        createdAt: '2020-05-26T14:31:19.675Z',
        updatedAt: '2020-05-26T14:31:43.015Z',
        __v: 0,
        actions: [
            'action_session_start',
            'action_listen',
            'action_default_fallback',
            'utter_coffee',
            'utter_tea',
            'utter_sugar',
            'utter_oknosugar',
        ],
        intents: [
            'get_started',
            'hi',
            'no',
            'yes',
        ],
        language: 'en',
        userId: null,
    },

];
