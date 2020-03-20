

exports.storyFixture = {
    _id: 'vRTJCXF5dmohJ53Kz',
    title: 'Welcome Story',
    storyGroupId: 'pYAvAsYw256uy8bGF',
    projectId: 'bf',
    events: [
        'utter_hello',
        'utter_tXd-Pm66',
        'utter_Xywmv8uc',
        'utter_hwZIDQ5P',
        'utter_0H5XEC9h',
        'action_help',
    ],
    branches: [
        {
            title: 'New Branch 1',
            branches: [],
            _id: 'wBzDjbDu',
            story: '* helpOptions\n  - action_help\n  - utter_tXd-Pm66',
        },
        {
            title: 'New Branch 2',
            branches: [],
            _id: 'vQMx0FvVC',
            story:
                '* how_are_you\n  - utter_Xywmv8uc\n* mood{"positive": "good"}\n  - utter_hwZIDQ5P\n  - utter_0H5XEC9h\n  - slot{"mood":"set"}',
        },
    ],
    story: '* hello\n - utter_hello',
};



exports.textFixture = {
    _id: '-dov7xR0',
    key: 'utter_Xywmv8uc',
    projectId: 'bf',
    values: [
        {
            lang: 'en',
            sequence: [
                { content: 'text: Hi i am great, how about you?' },
                { content: 'text: good! how are you?' },
            ],
        },
        {
            lang: 'fr',
            sequence: [
                { content: 'text: \'sava, et toi?\'\n' },
            ],
        },
    ],
};

exports.quickReplyFixture = {
    _id: '8SKEODsv',
    key: 'utter_tXd-Pm66',
    projectId: 'bf',
    textIndex:
        'utter_tXd-Pm66\nyou can get help with the following:\nwebsite navigation\nnavigation_help\nI have a different question\nhttp://google.com',
    values: [
        {
            lang: 'en',
            sequence: [
                {
                    content:
                        'text: \'you can get help with the following:\'\nbuttons:\n  - title: website navigation\n    type: postback\n    payload: /navigation_help\n  - title: I have a different question\n    type: web_url\n    url: \'http://google.com\'\n',
                },
            ],
        },
    ],
};

exports.customFixture = {
    _id: '5e6940a98300383bea9f3ef1',
    key: 'utter_custom',
    values: [
        {
            lang: 'en',
            sequence: [{ content: '__typename: CustomPayload\ncustom:\n  test: true\n' }],
        },
    ],
    projectId: 'bf',
    textIndex: 'utter_custom\ntest: true ',
};

exports.imageFixture = {
    _id: 'hBuOaiLL',
    key: 'utter_0H5XEC9h',
    projectId: 'bf',
    textIndex: 'utter_0H5XEC9h',
    values: [
        {
            lang: 'en',
            sequence: [
                {
                    content:
                        'image: >-\n  https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png\ntext: \'\'\n',
                },
            ],
        },
    ],
};