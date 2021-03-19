export const validDefaultDomain = {
    filename: 'default-domain1.yml',
    rawText:
    `slots:
    test_message:
      type: unfeaturized
actions:
    - action_aaa
responses:
    utter_greet:
      - text: "Hey there!"
        metadata:
          language: en
    utter_goodbye:
      - text: "Goodbye :("
        metadata:
          language: en
    utter_double:
      - text: "Hey there!1"
        metadata:
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
        metadata:
          language: en
    utter_iamabot:
      - text: "I am a bot, powered by Rasa."
        metadata:
          language: en
    utter_double:
      - text: "Hey there!2"
        metadata:
          language: en
    utter_greet:
      - text: "Salut!"
        metadata:
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
        test_message: { type: 'unfeaturized' },
    },
    responses: {
        utter_goodbye: [
            {
                metadata: { language: 'en' },
                text: 'Goodbye :(',
            },
        ],
        utter_greet: [
            {
                metadata: { language: 'en' },
                text: 'Hey there!',
            },
        ],
        utter_double: [
            {
                metadata: { language: 'en' },
                text: 'Hey there!1',
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
                metadata: { language: 'en' },
                text: 'I am a bot, powered by Rasa.',
            },
        ],
        utter_greet: [
            {
                metadata: { language: 'fr' },
                text: 'Salut!',
            },
        ],
        utter_youarewelcome: [
            {
                metadata: { language: 'fr' },
                text: 'You\'re very welcome.',
            },
        ],
        utter_double: [
            {
                metadata: { language: 'en' },
                text: 'Hey there!2',
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
            test_message: { type: 'unfeaturized' },
            info_message: { type: 'unfeaturized' },
        },
    responses: {
        utter_double: [
            {
                metadata: { language: 'en' },
                text: 'Hey there!1',
            },
        ],
        utter_goodbye: [
            {
                metadata: { language: 'en' },
                text: 'Goodbye :(',
            },
        ],
        utter_greet: [
            {
                metadata: { language: 'en' },
                text: 'Hey there!',
            },
        ],
        utter_iamabot: [
            {
                metadata: { language: 'en' },
                text: 'I am a bot, powered by Rasa.',
            },
        ],
        utter_youarewelcome: [
            {
                metadata: { language: 'en' },
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
