export const stories = [
    {
        _id: '4ZyYiKcpqzrw4eJy2',
        story: '* get_started\n    - utter_get_started',
        title: 'Get started',
        storyGroupId: 'XHPSA3kAvDxrFMzT3',
        projectId: 'chitchat-snb6bV8s9',
        events: [
            'utter_get_started',
        ],
        branches: [],
    },
    {
        _id: 'kzZ2uYqLvXbvZaYhN',
        story: '* chitchat.greet\n    - utter_hi',
        title: 'Greetings',
        storyGroupId: 'XTJ26uuy9Wu5zyGw6',
        projectId: 'chitchat-snb6bV8s9',
        events: [
            'utter_hi',
        ],
        branches: [],
    },
    {
        _id: '6t6KakNziXHArAj4n',
        story: '* chitchat.bye OR hi\n    - utter_bye',
        title: 'Farewells',
        storyGroupId: 'XTJ26uuy9Wu5zyGw6',
        projectId: 'chitchat-snb6bV8s9',
        events: [
            'utter_bye',
        ],
        branches: [],
    },
];


export const storiesWithCheckpoints = [
    {
        _id: '4ZyYiKcpqzrw4eJy2',
        story: '* get_started\n    - utter_get_started',
        title: 'Get started',
        storyGroupId: 'XHPSA3kAvDxrFMzT3',
        projectId: 'chitchat-snb6bV8s9',
        events: [
            'utter_get_started',
        ],
        textIndex: {
            contents: 'get_started \n utter_get_started',
            info: 'Get started',
        },
        branches: [],
    },
    {
        _id: 'kzZ2uYqLvXbvZaYhN',
        story: '* chitchat.greet\n    - utter_hi',
        title: 'Greetings',
        storyGroupId: 'XTJ26uuy9Wu5zyGw6',
        projectId: 'chitchat-snb6bV8s9',
        events: [
            'utter_hi',
        ],
        textIndex: {
            contents: 'chitchat.greet \n utter_hi',
            info: 'Greetings',
        },
        branches: [],
    },
    {
        _id: '6t6KakNziXHArAj4n',
        story: '* chitchat.bye OR hi\n    - utter_bye',
        title: 'Farewells',
        storyGroupId: 'XTJ26uuy9Wu5zyGw6',
        projectId: 'chitchat-snb6bV8s9',
        events: [
            'utter_bye',
        ],
        textIndex: {
            contents: 'chitchat.bye OR hi \n utter_bye',
            info: 'Farewells',
        },
        branches: [],
        checkpoints: [
            [
                'kzZ2uYqLvXbvZaYhN',
            ],
        ],
    },
];


export const storyGroups = [

    {
        _id: 'XHPSA3kAvDxrFMzT3',
        name: 'Intro stories',
        projectId: 'chitchat-snb6bV8s9',
        children: [
            '4ZyYiKcpqzrw4eJy2',
        ],
        updatedAt: {
            $date: {
                $numberLong: '1586892576649',
            },
        },
        selected: false,
        isExpanded: true,
    },
    {
        _id: 'XTJ26uuy9Wu5zyGw6',
        name: 'Default stories',
        projectId: 'chitchat-snb6bV8s9',
        children: [
            '6t6KakNziXHArAj4n',
            'kzZ2uYqLvXbvZaYhN',
        ],
        updatedAt: {
            $date: {
                $numberLong: '1586892576676',
            },
        },
        selected: false,
        isExpanded: true,
    },
];


export const responses = [
    {
        _id: '5e9718ba4cd5754b43c3970b',
        key: 'utter_bye',
        values: [
            {
                lang: 'en',
                sequence: [
                    {
                        content: '__typename: TextPayload\ntext: bye\n',
                    },
                ],
            },
        ],
        projectId: 'chitchat-snb6bV8s9',
        textIndex: 'utter_bye\nbye',
    },
    {
        _id: '5e9718c54cd5754b43c3970c',
        key: 'utter_hi',
        values: [
            {
                lang: 'en',
                sequence: [
                    {
                        content: '__typename: TextPayload\ntext: hi\n',
                    },
                ],
            },
        ],
        projectId: 'chitchat-snb6bV8s9',
        textIndex: 'utter_hi\nhi',
    },
    {
        _id: '5e9718d94cd5754b43c3970d',
        key: 'utter_get_started',
        values: [
            {
                lang: 'en',
                sequence: [
                    {
                        content: '__typename: TextPayload\ntext: get started !\n',
                    },
                ],
            },
        ],
        projectId: 'chitchat-snb6bV8s9',
        textIndex: 'utter_get_started\nget started !',
    },

];

export const defaultDomain = 'slots:  disambiguation_message:    type: unfeaturizedactions:  - action_botfront_disambiguation  - action_botfront_disambiguation_followup  - action_botfront_fallback  - action_botfront_mapping';

export const storiesFormatedForRasa = ['# Intro stories\n\n## Get started\n* get_started\n    - utter_get_started',
    '# Default stories\n\n## Greetings\n* chitchat.greet\n    - utter_hi\n## Farewells\n* chitchat.bye OR hi\n    - utter_bye'];

export const storiesFormatedForRasaWithCheckpoints = ['# Intro stories\n\n## Get started\n* get_started\n    - utter_get_started',
    '# Default stories\n\n## Greetings\n* chitchat.greet\n    - utter_hi\n> checkpoint_0\n## Farewells\n> checkpoint_0\n* chitchat.bye OR hi\n    - utter_bye'];
