export const stories01 = [{
    _id: '6c29002f-8a9a-4151-a6e7-704396267dcd',
    steps: [{ intent: 'chitchat.greet' }, { action: 'utter_hi' }],
    title: 'Greetings',
    metadata: { group: 'First Story Fixture' },
    branches: [],
    checkpoints: [],
}];

export const stories01_02 = [
    {
        _id: '9b6c01fd-2aa5-47a5-a96c-1b3eb292b919',
        steps: [{ intent: 'chitchat.greet' }, { action: 'utter_hi' }],
        title: 'Greetings',
        metadata: { group: 'First Story Fixture' },
        branches: [],
        checkpoints: [['4b16d56d-6da7-41e2-a8c8-23f83dbf5fd5']],
    },
    {
        _id: '4b16d56d-6da7-41e2-a8c8-23f83dbf5fd5',
        steps: [{ intent: 'goodbye' }, { action: 'utter_bye' }],
        title: 'Farewells',
        metadata: { group: 'Second Story Fixture' },
        branches: [],
        checkpoints: [
            [
                '85ed63e5-a9f9-4ba9-becf-7a3e229990df',
                'A1vN98Uu20',
                'yJ8XgXJYm',
            ],
            [
                '85ed63e5-a9f9-4ba9-becf-7a3e229990df',
                'A1vN98Uu20',
                'o-7aIzQmj7',
            ],
        ],
    },
    {
        _id: '85ed63e5-a9f9-4ba9-becf-7a3e229990df',
        steps: [{ intent: 'get_started' }, { action: 'utter_get_started' }],
        title: 'Get started',
        metadata: { group: 'Second Story Fixture' },
        branches: [
            {
                _id: 'A1vN98Uu20',
                steps: [{ action: 'action_nice' }],
                title: 'New Branch 2',
                branches: [
                    {
                        _id: 'yJ8XgXJYm',
                        steps: [{ action: 'action_looping_you_back' }],
                        title: 'New Branch 1',
                        branches: [],
                    },
                    {
                        _id: 'o-7aIzQmj7',
                        steps: [{ action: 'action_looping_you_back' }],
                        title: 'New Branch 2',
                        branches: [],
                    },
                ],
            },
        ],
        checkpoints: [],
    },
];


export const storyWithAction = {
    filename: 'stories.yml',
    rawText:
    `stories:
- story: greet help
  steps:
   - intent: greet
   - action: utter_greet
   - action: action_get_help`,
    dataType: 'training_data',
};


export const storyWithActionParsed = {
    nlu: {},
    rules: [],
    stories: [
        {
            branches: [],
            checkpoints: [],
            metadata: {
                group: 'stories.yml',
            },
            steps: [
                {
                    intent: 'greet',
                },
                {
                    action: 'utter_greet',
                },
                {
                    action: 'action_get_help',
                },
            ],
            title: 'greet help',
        },
    ],
};
