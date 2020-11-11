export const validDefaultDomain = {
    filename: 'default-domain1.yml',
    rawText:
    `slots:
    disambiguation_message:
      type: unfeaturized
actions:
    - action_aaa
responses:
    utter_greet:
      - text: "Hey there!"
        language: en
    utter_goodbye:
      - text: "Goodbye :("
        language: en
forms:
    restaurant_form:
       cuisine:
          - type: from_entity
            entity: cuisine`,
    dataType: 'defaultdomain',
};

export const validDefaultDomain2 = {
    filename: 'default-domain2.yml',
    rawText:
    `slots:
    info_message:
      type: unfeaturized
actions:
    - action_bbb
    - action_aaa
    - action_ccc
responses:
    utter_youarewelcome:
      - text: "You're very welcome."
        language: en
    utter_iamabot:
      - text: "I am a bot, powered by Rasa."
        language: en
    `,
    dataType: 'defaultdomain',
};

export const invalidDefaultDomain = {
    filename: 'default-domain3.yml',
    rawText:
    `
    slots:
a_message:
      type: unfeaturized
actions:
    - action_zzz
    - action_yyy
     - action_ccc
    `,
    dataType: 'defaultdomain',
};

export const validDefaultDomainParsed = {
    slots: {
        disambiguation_message: { type: 'unfeaturized' },
    },
    responses: {
        utter_goodbye: [
            {
                language: 'en',
                text: 'Goodbye :(',
            },
        ],
        utter_greet: [
            {
                language: 'en',
                text: 'Hey there!',
            },
        ],
    },
    forms: {
        restaurant_form: {
            cuisine: [
                {
                    entity: 'cuisine',
                    type: 'from_entity',
                },
            ],
        },
    },
    actions: [
        'action_aaa',
    ],
};


export const validDefaultDomainParsed2 = {
    slots:
        {
            info_message: { type: 'unfeaturized' },
           
        },
    responses: {
        utter_iamabot: [
            {
                language: 'en',
                text: 'I am a bot, powered by Rasa.',
            },
        ],
        utter_youarewelcome: [
            {
                language: 'en',
                text: 'You\'re very welcome.',
            },
        ],
    },
    forms: {},
    actions: [
        'action_bbb',
        'action_aaa',
        'action_ccc',
    ],
};


export const mergedDefaultDomains = {
    slots:
        {
            disambiguation_message: { type: 'unfeaturized' },
            info_message: { type: 'unfeaturized' },
        },
    responses: {
        utter_goodbye: [
            {
                language: 'en',
                text: 'Goodbye :(',
            },
        ],
        utter_greet: [
            {
                language: 'en',
                text: 'Hey there!',
            },
        ],
        utter_iamabot: [
            {
                language: 'en',
                text: 'I am a bot, powered by Rasa.',
            },
        ],
        utter_youarewelcome: [
            {
                language: 'en',
                text: 'You\'re very welcome.',
            },
        ],
    },
    forms: {
        restaurant_form: {
            cuisine: [
                {
                    entity: 'cuisine',
                    type: 'from_entity',
                },
            ],
        },
    },
    actions: [
        'action_aaa',
        'action_bbb',
        'action_ccc',
    ],
};
