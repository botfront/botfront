export const validConversations = {
    filename: 'conversationtest.yml',
    rawText:
    ` [
        {
          "_id": "6c1dd8f196fc413bb934a9307d18f87f",
          "env": "development",
          "projectId": "bf",
          "__v": 0,
          "actions": [
            "action_session_start",
            "action_listen",
            "utter_cgMeFnuj5",
            "utter_uCag8LL6z"
          ],
          "createdAt": "2020-10-29T16:27:22.628Z",
          "intents": [
            "get_started",
            "chitchat.greet",
            "chitchat.bye"
          ],
          "status": "read",
          "tracker": {
            "events": [
              {
                "event": "action",
                "timestamp": 1603988842.6469803,
                "name": "action_session_start",
                "policy": null,
                "confidence": null
              },
              {
                "event": "session_started",
                "timestamp": 1603988842.6470075,
                "metadata": {
                  "language": "en"
                }
              },
              {
                "event": "action",
                "timestamp": 1603988842.6470785,
                "name": "action_listen",
                "policy": null,
                "confidence": null
              },
              {
                "event": "user",
                "timestamp": 1603988842.6491432,
                "metadata": {
                  "language": "en"
                },
                "text": "/get_started",
                "parse_data": {
                  "intent": {
                    "name": "get_started",
                    "confidence": 1
                  },
                  "entities": [],
                  "text": "/get_started",
                  "message_id": "fee70b3521cb4f33ab7f180ef82f6937",
                  "metadata": {
                    "language": "en"
                  },
                  "intent_ranking": [
                    {
                      "name": "get_started",
                      "confidence": 1
                    }
                  ]
                },
                "input_channel": "webchat",
                "message_id": "fee70b3521cb4f33ab7f180ef82f6937"
              },
              {
                "event": "action",
                "timestamp": 1603988842.668605,
                "name": "action_listen",
                "policy": "policy_0_TEDPolicy",
                "confidence": 0.13847102224826813
              },
              {
                "event": "user",
                "timestamp": 1603988845.7165892,
                "metadata": {
                  "language": "en"
                },
                "text": "hello",
                "parse_data": {
                  "intent": {
                    "id": -5313782274444470000,
                    "name": "chitchat.greet",
                    "confidence": 1
                  },
                  "entities": [],
                  "text": "hello",
                  "message_id": "972a61a4ccc44464af14b80ef473fcae",
                  "metadata": {
                    "language": "en"
                  },
                  "intent_ranking": [
                    {
                      "id": -5313782274444470000,
                      "name": "chitchat.greet",
                      "confidence": 1,
                      "canonical": "yo"
                    },
                    {
                      "id": -4551433371507634000,
                      "name": "chitchat.bye",
                      "confidence": 8.004683027529325e-11,
                      "canonical": "okay see you later"
                    }
                  ]
                },
                "input_channel": "webchat",
                "message_id": "972a61a4ccc44464af14b80ef473fcae"
              },
              {
                "event": "action",
                "timestamp": 1603988845.758904,
                "name": "utter_cgMeFnuj5",
                "policy": "policy_0_TEDPolicy",
                "confidence": 0.12050042301416397
              },
              {
                "event": "bot",
                "timestamp": 1603988845.758927,
                "metadata": {
                  "template_name": "utter_cgMeFnuj5"
                },
                "text": "hey",
                "data": {
                  "elements": null,
                  "quick_replies": null,
                  "buttons": null,
                  "attachment": null,
                  "image": null,
                  "custom": null
                }
              },
              {
                "event": "action",
                "timestamp": 1603988845.7783911,
                "name": "action_listen",
                "policy": "policy_0_TEDPolicy",
                "confidence": 0.3149728775024414
              },
              {
                "event": "user",
                "timestamp": 1603988850.4481628,
                "metadata": {
                  "language": "en"
                },
                "text": "bye",
                "parse_data": {
                  "intent": {
                    "id": -4551433371507634000,
                    "name": "chitchat.bye",
                    "confidence": 1
                  },
                  "entities": [],
                  "text": "bye",
                  "message_id": "9178eafaf43c410287e9244af74b531b",
                  "metadata": {
                    "language": "en"
                  },
                  "intent_ranking": [
                    {
                      "id": -4551433371507634000,
                      "name": "chitchat.bye",
                      "confidence": 1,
                      "canonical": "okay see you later"
                    },
                    {
                      "id": -5313782274444470000,
                      "name": "chitchat.greet",
                      "confidence": 8.21301533726615e-12,
                      "canonical": "yo"
                    }
                  ]
                },
                "input_channel": "webchat",
                "message_id": "9178eafaf43c410287e9244af74b531b"
              },
              {
                "event": "action",
                "timestamp": 1603988850.4888542,
                "name": "utter_uCag8LL6z",
                "policy": "policy_0_TEDPolicy",
                "confidence": 0.10978454351425171
              },
              {
                "event": "bot",
                "timestamp": 1603988850.488874,
                "metadata": {
                  "template_name": "utter_uCag8LL6z"
                },
                "text": "bye",
                "data": {
                  "elements": null,
                  "quick_replies": null,
                  "buttons": null,
                  "attachment": null,
                  "image": null,
                  "custom": null
                }
              },
              {
                "event": "action",
                "timestamp": 1603988850.5068603,
                "name": "action_listen",
                "policy": "policy_0_TEDPolicy",
                "confidence": 0.26052072644233704
              }
            ],
            "followup_action": null,
            "latest_action": {
              "action_name": "action_listen"
            },
            "latest_action_name": "action_listen",
            "latest_event_time": 1603988850.5068603,
            "latest_input_channel": "webchat",
            "latest_message": {
              "intent": {
                "id": -4551433371507634000,
                "name": "chitchat.bye",
                "confidence": 1
              },
              "entities": [],
              "text": "bye",
              "message_id": "9178eafaf43c410287e9244af74b531b",
              "metadata": {
                "language": "en"
              },
              "intent_ranking": [
                {
                  "id": -4551433371507634000,
                  "name": "chitchat.bye",
                  "confidence": 1,
                  "canonical": "okay see you later"
                },
                {
                  "id": -5313782274444470000,
                  "name": "chitchat.greet",
                  "confidence": 8.21301533726615e-12,
                  "canonical": "yo"
                }
              ]
            },
            "paused": false,
            "sender_id": "6c1dd8f196fc413bb934a9307d18f87f",
            "slots": {
              "disambiguation_message": null,
              "fallback_language": "en"
            }
          },
          "updatedAt": "2020-10-29T16:27:30.507Z",
          "language": "en"
        },
        {
          "_id": "bd29adc3837a45a7b4b549976c8851e1",
          "env": "development",
          "projectId": "bf",
          "__v": 0,
          "actions": [
            "action_session_start",
            "action_listen",
            "action_default_fallback"
          ],
          "createdAt": "2020-10-29T16:22:40.429Z",
          "intents": [
            "get_started",
            "chitchat.greet"
          ],
          "status": "read",
          "tracker": {
            "events": [
              {
                "event": "action",
                "timestamp": 1603988560.4652884,
                "name": "action_session_start",
                "policy": null,
                "confidence": null
              },
              {
                "event": "session_started",
                "timestamp": 1603988560.46531,
                "metadata": {
                  "language": "en"
                }
              },
              {
                "event": "action",
                "timestamp": 1603988560.4654324,
                "name": "action_listen",
                "policy": null,
                "confidence": null
              },
              {
                "event": "user",
                "timestamp": 1603988560.4669797,
                "metadata": {
                  "language": "en"
                },
                "text": "/get_started",
                "parse_data": {
                  "intent": {
                    "name": "get_started",
                    "confidence": 1
                  },
                  "entities": [],
                  "text": "/get_started",
                  "message_id": "f6836ff332f24e61a910648a7aa67e0e",
                  "metadata": {
                    "language": "en"
                  },
                  "intent_ranking": [
                    {
                      "name": "get_started",
                      "confidence": 1
                    }
                  ]
                },
                "input_channel": "webchat",
                "message_id": "f6836ff332f24e61a910648a7aa67e0e"
              },
              {
                "event": "action",
                "timestamp": 1603988560.5015366,
                "name": "action_default_fallback",
                "policy": "policy_1_RulePolicy",
                "confidence": 0.3
              },
              {
                "event": "bot",
                "timestamp": 1603988560.5015585,
                "metadata": {
                  "template_name": "utter_default"
                },
                "text": "utter_default",
                "data": {
                  "elements": null,
                  "quick_replies": null,
                  "buttons": null,
                  "attachment": null,
                  "image": null,
                  "custom": null
                }
              },
              {
                "event": "rewind",
                "timestamp": 1603988560.5015693
              },
              {
                "event": "action",
                "timestamp": 1603988560.505053,
                "name": "action_listen",
                "policy": null,
                "confidence": 1
              },
              {
                "event": "user",
                "timestamp": 1603988563.43351,
                "metadata": {
                  "language": "en"
                },
                "text": "hello",
                "parse_data": {
                  "intent": {
                    "id": -5313782274444470000,
                    "name": "chitchat.greet",
                    "confidence": 1
                  },
                  "entities": [],
                  "text": "hello",
                  "message_id": "b63cfa6999184401914c4ae24bb6525d",
                  "metadata": {
                    "language": "en"
                  },
                  "intent_ranking": [
                    {
                      "id": -5313782274444470000,
                      "name": "chitchat.greet",
                      "confidence": 1,
                      "canonical": "yo"
                    },
                    {
                      "id": -4551433371507634000,
                      "name": "chitchat.bye",
                      "confidence": 8.004683027529325e-11,
                      "canonical": "okay see you later"
                    }
                  ]
                },
                "input_channel": "webchat",
                "message_id": "b63cfa6999184401914c4ae24bb6525d"
              },
              {
                "event": "action",
                "timestamp": 1603988563.4815333,
                "name": "action_default_fallback",
                "policy": "policy_1_RulePolicy",
                "confidence": 0.3
              },
              {
                "event": "bot",
                "timestamp": 1603988563.48166,
                "metadata": {
                  "template_name": "utter_default"
                },
                "text": "utter_default",
                "data": {
                  "elements": null,
                  "quick_replies": null,
                  "buttons": null,
                  "attachment": null,
                  "image": null,
                  "custom": null
                }
              },
              {
                "event": "rewind",
                "timestamp": 1603988563.4816837
              },
              {
                "event": "action",
                "timestamp": 1603988563.491028,
                "name": "action_listen",
                "policy": null,
                "confidence": 1
              },
              {
                "event": "user",
                "timestamp": 1603988564.7807665,
                "metadata": {
                  "language": "en"
                },
                "text": "hi",
                "parse_data": {
                  "intent": {
                    "id": -5313782274444470000,
                    "name": "chitchat.greet",
                    "confidence": 1
                  },
                  "entities": [],
                  "text": "hi",
                  "message_id": "ba466a14a88c410ca832b078f8582dd2",
                  "metadata": {
                    "language": "en"
                  },
                  "intent_ranking": [
                    {
                      "id": -5313782274444470000,
                      "name": "chitchat.greet",
                      "confidence": 1,
                      "canonical": "yo"
                    },
                    {
                      "id": -4551433371507634000,
                      "name": "chitchat.bye",
                      "confidence": 2.1629625174268696e-11,
                      "canonical": "okay see you later"
                    }
                  ]
                },
                "input_channel": "webchat",
                "message_id": "ba466a14a88c410ca832b078f8582dd2"
              },
              {
                "event": "action",
                "timestamp": 1603988564.817048,
                "name": "action_default_fallback",
                "policy": "policy_1_RulePolicy",
                "confidence": 0.3
              },
              {
                "event": "bot",
                "timestamp": 1603988564.817063,
                "metadata": {
                  "template_name": "utter_default"
                },
                "text": "utter_default",
                "data": {
                  "elements": null,
                  "quick_replies": null,
                  "buttons": null,
                  "attachment": null,
                  "image": null,
                  "custom": null
                }
              },
              {
                "event": "rewind",
                "timestamp": 1603988564.8170745
              },
              {
                "event": "action",
                "timestamp": 1603988564.8205776,
                "name": "action_listen",
                "policy": null,
                "confidence": 1
              }
            ],
            "followup_action": null,
            "latest_action": {
              "action_name": "action_listen"
            },
            "latest_action_name": "action_listen",
            "latest_event_time": 1603988564.8205776,
            "latest_input_channel": "webchat",
            "latest_message": {
              "entities": [],
              "text": null,
              "message_id": null
            },
            "paused": false,
            "sender_id": "bd29adc3837a45a7b4b549976c8851e1",
            "slots": {
              "disambiguation_message": null,
              "fallback_language": "en"
            }
          },
          "updatedAt": "2020-10-29T16:22:44.797Z",
          "language": "en"
        }
      ]`,
    dataType: 'conversations',
};

export const validConversationsParsed = [
    {
        _id: '6c1dd8f196fc413bb934a9307d18f87f',
        env: 'development',
        projectId: 'bf',
        __v: 0,
        actions: [
            'action_session_start',
            'action_listen',
            'utter_cgMeFnuj5',
            'utter_uCag8LL6z',
        ],
        createdAt: '2020-10-29T16:27:22.628Z',
        intents: [
            'get_started',
            'chitchat.greet',
            'chitchat.bye',
        ],
        status: 'read',
        tracker: {
        
            events: [
                {
                    event: 'action',
                    timestamp: 1603988842.6469803,
                    name: 'action_session_start',
                    policy: null,
                    confidence: null,
                },
                {
                    event: 'session_started',
                    timestamp: 1603988842.6470075,
                    metadata: {
                        language: 'en',
                    },
                },
                {
                    event: 'action',
                    timestamp: 1603988842.6470785,
                    name: 'action_listen',
                    policy: null,
                    confidence: null,
                },
                {
                    event: 'user',
                    timestamp: 1603988842.6491432,
                    metadata: {
                        language: 'en',
                    },
                    text: '/get_started',
                    parse_data: {
                        intent: {
                            name: 'get_started',
                            confidence: 1,
                        },
                        entities: [],
                        text: '/get_started',
                        message_id: 'fee70b3521cb4f33ab7f180ef82f6937',
                        metadata: {
                            language: 'en',
                        },
                        intent_ranking: [
                            {
                                name: 'get_started',
                                confidence: 1,
                            },
                        ],
                    },
                    input_channel: 'webchat',
                    message_id: 'fee70b3521cb4f33ab7f180ef82f6937',
                },
                {
                    event: 'action',
                    timestamp: 1603988842.668605,
                    name: 'action_listen',
                    policy: 'policy_0_TEDPolicy',
                    confidence: 0.13847102224826813,
                },
                {
                    event: 'user',
                    timestamp: 1603988845.7165892,
                    metadata: {
                        language: 'en',
                    },
                    text: 'hello',
                    parse_data: {
                        intent: {
                            id: -5313782274444470000,
                            name: 'chitchat.greet',
                            confidence: 1,
                        },
                        entities: [],
                        text: 'hello',
                        message_id: '972a61a4ccc44464af14b80ef473fcae',
                        metadata: {
                            language: 'en',
                        },
                        intent_ranking: [
                            {
                                id: -5313782274444470000,
                                name: 'chitchat.greet',
                                confidence: 1,
                                canonical: 'yo',
                            },
                            {
                                id: -4551433371507634000,
                                name: 'chitchat.bye',
                                confidence: 8.004683027529325e-11,
                                canonical: 'okay see you later',
                            },
                        ],
                    },
                    input_channel: 'webchat',
                    message_id: '972a61a4ccc44464af14b80ef473fcae',
                },
                {
                    event: 'action',
                    timestamp: 1603988845.758904,
                    name: 'utter_cgMeFnuj5',
                    policy: 'policy_0_TEDPolicy',
                    confidence: 0.12050042301416397,
                },
                {
                    event: 'bot',
                    timestamp: 1603988845.758927,
                    metadata: {
                        template_name: 'utter_cgMeFnuj5',
                    },
                    text: 'hey',
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
                    timestamp: 1603988845.7783911,
                    name: 'action_listen',
                    policy: 'policy_0_TEDPolicy',
                    confidence: 0.3149728775024414,
                },
                {
                    event: 'user',
                    timestamp: 1603988850.4481628,
                    metadata: {
                        language: 'en',
                    },
                    text: 'bye',
                    parse_data: {
                        intent: {
                            id: -4551433371507634000,
                            name: 'chitchat.bye',
                            confidence: 1,
                        },
                        entities: [],
                        text: 'bye',
                        message_id: '9178eafaf43c410287e9244af74b531b',
                        metadata: {
                            language: 'en',
                        },
                        intent_ranking: [
                            {
                                id: -4551433371507634000,
                                name: 'chitchat.bye',
                                confidence: 1,
                                canonical: 'okay see you later',
                            },
                            {
                                id: -5313782274444470000,
                                name: 'chitchat.greet',
                                confidence: 8.21301533726615e-12,
                                canonical: 'yo',
                            },
                        ],
                    },
                    input_channel: 'webchat',
                    message_id: '9178eafaf43c410287e9244af74b531b',
                },
                {
                    event: 'action',
                    timestamp: 1603988850.4888542,
                    name: 'utter_uCag8LL6z',
                    policy: 'policy_0_TEDPolicy',
                    confidence: 0.10978454351425171,
                },
                {
                    event: 'bot',
                    timestamp: 1603988850.488874,
                    metadata: {
                        template_name: 'utter_uCag8LL6z',
                    },
                    text: 'bye',
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
                    timestamp: 1603988850.5068603,
                    name: 'action_listen',
                    policy: 'policy_0_TEDPolicy',
                    confidence: 0.26052072644233704,
                },
            ],
            followup_action: null,
            latest_action: {
                action_name: 'action_listen',
            },
            latest_action_name: 'action_listen',
            latest_event_time: 1603988850.5068603,
            latest_input_channel: 'webchat',
            latest_message: {
                intent: {
                    id: -4551433371507634000,
                    name: 'chitchat.bye',
                    confidence: 1,
                },
                entities: [],
                text: 'bye',
                message_id: '9178eafaf43c410287e9244af74b531b',
                metadata: {
                    language: 'en',
                },
                intent_ranking: [
                    {
                        id: -4551433371507634000,
                        name: 'chitchat.bye',
                        confidence: 1,
                        canonical: 'okay see you later',
                    },
                    {
                        id: -5313782274444470000,
                        name: 'chitchat.greet',
                        confidence: 8.21301533726615e-12,
                        canonical: 'yo',
                    },
                ],
            },
            paused: false,
            sender_id: '6c1dd8f196fc413bb934a9307d18f87f',
            slots: {
                disambiguation_message: null,
                fallback_language: 'en',
            },
        },
        updatedAt: '2020-10-29T16:27:30.507Z',
        language: 'en',
    },
    {
        _id: 'bd29adc3837a45a7b4b549976c8851e1',
        env: 'development',
        projectId: 'bf',
        __v: 0,
        actions: [
            'action_session_start',
            'action_listen',
            'action_default_fallback',
        ],
        createdAt: '2020-10-29T16:22:40.429Z',
        intents: [
            'get_started',
            'chitchat.greet',
        ],
        status: 'read',
        tracker: {
            events: [
                {
                    event: 'action',
                    timestamp: 1603988560.4652884,
                    name: 'action_session_start',
                    policy: null,
                    confidence: null,
                },
                {
                    event: 'session_started',
                    timestamp: 1603988560.46531,
                    metadata: {
                        language: 'en',
                    },
                },
                {
                    event: 'action',
                    timestamp: 1603988560.4654324,
                    name: 'action_listen',
                    policy: null,
                    confidence: null,
                },
                {
                    event: 'user',
                    timestamp: 1603988560.4669797,
                    metadata: {
                        language: 'en',
                    },
                    text: '/get_started',
                    parse_data: {
                        intent: {
                            name: 'get_started',
                            confidence: 1,
                        },
                        entities: [],
                        text: '/get_started',
                        message_id: 'f6836ff332f24e61a910648a7aa67e0e',
                        metadata: {
                            language: 'en',
                        },
                        intent_ranking: [
                            {
                                name: 'get_started',
                                confidence: 1,
                            },
                        ],
                    },
                    input_channel: 'webchat',
                    message_id: 'f6836ff332f24e61a910648a7aa67e0e',
                },
                {
                    event: 'action',
                    timestamp: 1603988560.5015366,
                    name: 'action_default_fallback',
                    policy: 'policy_1_RulePolicy',
                    confidence: 0.3,
                },
                {
                    event: 'bot',
                    timestamp: 1603988560.5015585,
                    metadata: {
                        template_name: 'utter_default',
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
                    timestamp: 1603988560.5015693,
                },
                {
                    event: 'action',
                    timestamp: 1603988560.505053,
                    name: 'action_listen',
                    policy: null,
                    confidence: 1,
                },
                {
                    event: 'user',
                    timestamp: 1603988563.43351,
                    metadata: {
                        language: 'en',
                    },
                    text: 'hello',
                    parse_data: {
                        intent: {
                            id: -5313782274444470000,
                            name: 'chitchat.greet',
                            confidence: 1,
                        },
                        entities: [],
                        text: 'hello',
                        message_id: 'b63cfa6999184401914c4ae24bb6525d',
                        metadata: {
                            language: 'en',
                        },
                        intent_ranking: [
                            {
                                id: -5313782274444470000,
                                name: 'chitchat.greet',
                                confidence: 1,
                                canonical: 'yo',
                            },
                            {
                                id: -4551433371507634000,
                                name: 'chitchat.bye',
                                confidence: 8.004683027529325e-11,
                                canonical: 'okay see you later',
                            },
                        ],
                    },
                    input_channel: 'webchat',
                    message_id: 'b63cfa6999184401914c4ae24bb6525d',
                },
                {
                    event: 'action',
                    timestamp: 1603988563.4815333,
                    name: 'action_default_fallback',
                    policy: 'policy_1_RulePolicy',
                    confidence: 0.3,
                },
                {
                    event: 'bot',
                    timestamp: 1603988563.48166,
                    metadata: {
                        template_name: 'utter_default',
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
                    timestamp: 1603988563.4816837,
                },
                {
                    event: 'action',
                    timestamp: 1603988563.491028,
                    name: 'action_listen',
                    policy: null,
                    confidence: 1,
                },
                {
                    event: 'user',
                    timestamp: 1603988564.7807665,
                    metadata: {
                        language: 'en',
                    },
                    text: 'hi',
                    parse_data: {
                        intent: {
                            id: -5313782274444470000,
                            name: 'chitchat.greet',
                            confidence: 1,
                        },
                        entities: [],
                        text: 'hi',
                        message_id: 'ba466a14a88c410ca832b078f8582dd2',
                        metadata: {
                            language: 'en',
                        },
                        intent_ranking: [
                            {
                                id: -5313782274444470000,
                                name: 'chitchat.greet',
                                confidence: 1,
                                canonical: 'yo',
                            },
                            {
                                id: -4551433371507634000,
                                name: 'chitchat.bye',
                                confidence: 2.1629625174268696e-11,
                                canonical: 'okay see you later',
                            },
                        ],
                    },
                    input_channel: 'webchat',
                    message_id: 'ba466a14a88c410ca832b078f8582dd2',
                },
                {
                    event: 'action',
                    timestamp: 1603988564.817048,
                    name: 'action_default_fallback',
                    policy: 'policy_1_RulePolicy',
                    confidence: 0.3,
                },
                {
                    event: 'bot',
                    timestamp: 1603988564.817063,
                    metadata: {
                        template_name: 'utter_default',
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
                    timestamp: 1603988564.8170745,
                },
                {
                    event: 'action',
                    timestamp: 1603988564.8205776,
                    name: 'action_listen',
                    policy: null,
                    confidence: 1,
                },
            ],
            followup_action: null,
            latest_action: {
                action_name: 'action_listen',
            },
            latest_action_name: 'action_listen',
            latest_event_time: 1603988564.8205776,
            latest_input_channel: 'webchat',
            latest_message: {
                entities: [],
                text: null,
                message_id: null,
            },
            paused: false,
            sender_id: 'bd29adc3837a45a7b4b549976c8851e1',
            slots: {
                disambiguation_message: null,
                fallback_language: 'en',
            },
        },
        updatedAt: '2020-10-29T16:22:44.797Z',
        language: 'en',
    },
];
