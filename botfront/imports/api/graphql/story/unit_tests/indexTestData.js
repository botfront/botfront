export const storyId = 'TEST_STORY';
export const projectId = 'bf';
export const enModelId = 'TEST_MODEL_EN';
export const frModelId = 'TEST_MODEL_FR';

export const storyFixture = {
    _id: storyId,
    story: '* get_started\n    - utter_get_started\n  - slot{"test_slot":true}\n  - action_testAction\n* get_started{"timeOfDay": "morning"}\n    - utter_TEST\n    - utter_image\n    - utter_quick\n    - utter_custom',
    title: 'story fixture',
    storyGroupId: 'TEST_STORY_GROUP',
    projectId: 'bf',
    events: ['utter_get_started', 'utter_h_0GF2S1'],
    branches: [],
};

export const frModelFixture = {
    _id: frModelId,
    name: 'My First Model',
    language: 'fr',
    config:
        'pipeline:\n  - name: WhitespaceTokenizer\n  - name: CountVectorsFeaturizer\n  - name: DIETClassifier\n  - name: rasa_addons.nlu.components.gazette.Gazette\n  - name: EntitySynonymMapper',
    evaluations: [],
    intents: [],
    chitchat_intents: [],
    training_data: {
        common_examples: [
            {
                _id: '055ba31b-b7ad-4ad4-8fd4-10fecccda971',
                text: 'comment peuvez vous m\'aider ce matin',
                intent: 'get_started',
                canonical: true,
                entities: [
                    {
                        start: 31,
                        end: 26,
                        value: 'matin',
                        entity: 'timeOfDay',
                    },
                ],
                updatedAt: { $date: { $numberLong: '1583766541865' } },
            },
            {
                _id: '1c2e3fdc-1b7d-41af-9c24-d424e772ab7e',
                text: 'bonjour AA',
                intent: 'hello',
                canonical: true,
                entities: [
                    {
                        start: 8,
                        end: 10,
                        value: 'AA',
                        entity: 'letters',
                    },
                ],
                updatedAt: { $date: { $numberLong: '1583522610598' } },
            },
            {
                _id: '3c4de3a0-2981-483c-8b91-e18a21d64363',
                text: 'salut BB',
                intent: 'hello',
                canonical: false,
                entities: [
                    {
                        start: 6,
                        end: 8,
                        value: 'BB',
                        entity: 'letters',
                    },
                ],
                updatedAt: { $date: { $numberLong: '1583522623487' } },
            },
        ],
        entity_synonyms: [],
        regex_features: [],
        fuzzy_gazette: [],
    },
    updatedAt: { $date: { $numberLong: '1583521349830' } },
};

export const enModelFixture = {
    _id: enModelId,
    name: 'Default Model',
    language: 'en',
    description: 'Default description',
    config:
               'pipeline:\n  - name: WhitespaceTokenizer\n  - name: CountVectorsFeaturizer\n  - name: DIETClassifier\n  - name: rasa_addons.nlu.components.gazette.Gazette\n  - name: EntitySynonymMapper',
    evaluations: [],
    intents: [],
    chitchat_intents: [],
    training_data: {
        common_examples: [
            {
                _id: '055ba31b-b7ad-4ad4-8fd4-10fecccda971',
                text: 'How can you help me this morning?',
                intent: 'get_started',
                canonical: true,
                entities: [
                    {
                        start: 24,
                        end: 31,
                        value: 'morning',
                        entity: 'timeOfDay',
                    },
                ],
                updatedAt: { $date: { $numberLong: '1583766541865' } },
            },
            { // to test that multiple intent matches do not break the search regexp
                _id: '055ba31b-b7ad-4ad4-8fd4-10fecccda971',
                text: 'How can you help me out this morning?',
                intent: 'get_started',
                canonical: true,
                entities: [
                    {
                        start: 28,
                        end: 35,
                        value: 'morning',
                        entity: 'timeOfDay',
                    },
                ],
                updatedAt: { $date: { $numberLong: '1583766541865' } },
            },
            {
                _id: '4aad51cb-cbb7-483d-ad73-4400994b4f0b',
                text: 'test AA',
                intent: 'test',
                canonical: false,
                entities: [
                    {
                        start: 5,
                        end: 7,
                        value: 'AA',
                        entity: 'letter',
                    },
                ],
                updatedAt: { $date: { $numberLong: '1583521335768' } },
            },
            {
                _id: '5edb3a01-ce18-4da3-b1d2-4ed4e50f336f',
                text: 'test BB',
                intent: 'test',
                canonical: true,
                entities: [
                    {
                        start: 5,
                        end: 7,
                        value: 'BB',
                        entity: 'letter',
                    },
                ],
                updatedAt: { $date: { $numberLong: '1583521349831' } },
            },
        ],
        entity_synonyms: [],
        regex_features: [],
        fuzzy_gazette: [],
    },
    updatedAt: { $date: { $numberLong: '1583522623487' } },
};

export const projectFixture = {
    _id: projectId,
    name: 'My Project',
    defaultLanguage: 'en',
    namespace: 'bf-wack',
    defaultDomain: {
        content:
            'slots:\n  disambiguation_message:\n    type: unfeaturized\nactions:\n  - action_botfront_disambiguation\n  - action_botfront_disambiguation_followup\n  - action_botfront_fallback\n  - action_botfront_mapping',
    },
    disabled: false,
    nlu_models: [enModelId, frModelId],
    updatedAt: { $date: { $numberLong: '1583521253932' } },
};

export const botResponseFixture = {
    _id: 'E0TEcRTw',
    key: 'utter_get_started',
    projectId: 'bf',
    values: [
        {
            lang: 'en',
            sequence: [
                { content: 'text: test\nmetadata: null\n' },
                { content: 'text: Hi\n' },
            ],
        },
        {
            lang: 'fr',
            sequence: [
                { content: 'text: bonjour\nmetadata: null\n' },
                { content: 'text: merci de visiter notre site web\n' },
                { content: 'text: salut!\n' },
            ],
        },
    ],
};

export const botResponsesFixture = [
    {
        _id: 'E0TEcRTw',
        key: 'utter_get_started',
        projectId: 'bf',
        values: [
            {
                lang: 'en',
                sequence: [
                    { content: 'text: test\nmetadata: null\n' },
                    { content: 'text: Hi\n' },
                ],
            },
            {
                lang: 'fr',
                sequence: [
                    { content: 'text: bonjour\nmetadata: null\n' },
                    { content: 'text: merci de visiter notre site web\n' },
                    { content: 'text: salut!\n' },
                ],
            },
        ],
    },
    {
        _id: '5e6805edc1198ff7c7a93cdf',
        key: 'utter_TEST',
        values: [{ lang: 'en', sequence: [{ content: 'text: test 123\n' }] }],
        projectId: 'bf',
    },
    { // to test that multiple response matches do not break the search regexp
        _id: '5e6805edc1198ff7c7a93cdg',
        key: 'utter_TEST_B',
        values: [{ lang: 'en', sequence: [{ content: 'text: test 123\n' }] }],
        projectId: 'bf',
    },
    {
        _id: '5e68ef296adc1f03dfe94a4f',
        key: 'utter_quick',
        values: [
            {
                lang: 'en',
                sequence: [
                    {
                        content:
                                   'text: quick\nbuttons:\n  - title: title\n    type: postback\n    payload: \'/button_intent{"buttonEntity":"entitvyvalue"}\'\n  - title: second\n    type: postback\n    payload: /get_started\n  - title: go to google\n    type: web_url\n    url: \'http://google.com\'\nmetadata: null\n',
                    },
                ],
            },
        ],
        projectId: 'bf',
        metadata: null,
    },
    {
        _id: '5e68ef416adc1f03dfe94a51',
        key: 'utter_image',
        values: [
            {
                lang: 'en',
                sequence: [
                    {
                        content:
                                   'image: >-\n  https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png\n__typename: ImagePayload\ntext: \'\'\n',
                    },
                ],
            },
        ],
        projectId: 'bf',
    },
    {
        _id: '5e68ef6e6adc1f03dfe94a52',
        key: 'utter_custom',
        values: [
            {
                lang: 'en',
                sequence: [{ content: 'custom:\n  embedded:\n    title: "Canada"\nmetadata: null\n' }],
            },
        ],
        projectId: 'bf',
    },
];

export const slotFixture = {
    _id: 'oAhPBpeQpyabz7Q5i',
    type: 'bool',
    projectId: 'bf',
    name: 'testSlot',
};
