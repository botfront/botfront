export const storyId = 'TEST_STORY';
export const projectId = 'bf';
export const enModelId = 'TEST_MODEL_EN';
export const frModelId = 'TEST_MODEL_FR';

export const storyFixture = {
    _id: storyId,
    story: '* get_started\n    - utter_get_started\n  - slot{"test_slot":true}\n  - action_new\n* get_started{"projectName": "bf"}\n  - utter_get_started',
    title: 'Get started',
    storyGroupId: 'TEST_STORY_GROUP',
    projectId: 'bf',
    events: ['utter_get_started', 'utter_h_0GF2S1'],
    branches: [],
};


// story index
// responses index
// nlu index
// general index

export const frModelFixture = {
    _id: frModelId,
    name: 'My First Model',
    language: 'fr',
    config:
        'pipeline:\n  - name: WhitespaceTokenizer\n  - name: CountVectorsFeaturizer\n  - name: EmbeddingIntentClassifier\n  - BILOU_flag: true\n    name: CRFEntityExtractor\n    features:\n      - [low, title, upper]\n      - [low, bias, prefix5, prefix2, suffix5, suffix3, suffix2, upper, title, digit, pattern]\n      - [low, title, upper]\n  - name: rasa_addons.nlu.components.gazette.Gazette\n  - name: EntitySynonymMapper',
    evaluations: [],
    intents: [],
    chitchat_intents: [],
    training_data: {
        common_examples: [
            {
                _id: '055ba31b-b7ad-4ad4-8fd4-10fecccda971',
                text: 'bienvenue to project bf',
                intent: 'get_started',
                canonical: true,
                entities: [
                    {
                        start: 20,
                        end: 22,
                        value: 'bf',
                        entity: 'projectName',
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
               'pipeline:\n  - name: WhitespaceTokenizer\n  - name: CountVectorsFeaturizer\n  - name: EmbeddingIntentClassifier\n  - BILOU_flag: true\n    name: CRFEntityExtractor\n    features:\n      - [low, title, upper]\n      - [low, bias, prefix5, prefix2, suffix5, suffix3, suffix2, upper, title, digit, pattern]\n      - [low, title, upper]\n  - name: rasa_addons.nlu.components.gazette.Gazette\n  - name: EntitySynonymMapper',
    evaluations: [],
    intents: [],
    chitchat_intents: [],
    training_data: {
        common_examples: [
            {
                _id: '055ba31b-b7ad-4ad4-8fd4-10fecccda971',
                text: 'welcome to project bf',
                intent: 'get_started',
                canonical: true,
                entities: [
                    {
                        start: 19,
                        end: 21,
                        value: 'bf',
                        entity: 'projectName',
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
                { content: 'text: welcome to our website\n' },
            ],
        },
        {
            lang: 'fr',
            sequence: [
                { content: 'text: bonjour\nmetadata: null\n' },
                { content: 'text: bienvenue a notre site web\n' },
                { content: 'text: salut!\n' },
            ],
        },
    ],
};

export const slotFixture = {
    _id: 'oAhPBpeQpyabz7Q5i',
    type: 'bool',
    projectId: 'bf',
    name: 'test',
};
