export const validDomain = {
    filename: 'domain.yml',
    rawText:
    `actions:
    - action_aaa
    - utter_cgMeFnuj5
    - utter_uCag8LL6z
    - utter_J5MMvow26
intents:
    - chitchat.greet
    - chitchat.bye
    - haha
entities: []
responses:
    utter_cgMeFnuj5:
      - text: hey
        language: en
    utter_uCag8LL6z:
      - text: bye
        language: en
    utter_J5MMvow26:
      - text: haha
        language: en
slots:
    fallback_language:
      type: unfeaturized
      initial_value: en
    disambiguation_message:
      type: unfeaturized
forms: {}`,
    dataType: 'domain',
};

export const validDomainParsed = {
    actions: [
        'action_aaa',
        'utter_cgMeFnuj5',
        'utter_uCag8LL6z',
        'utter_J5MMvow26',
    ],
  
    responses: [
        {
            key: 'utter_cgMeFnuj5',
            values: [
                {
                    lang: 'en',
                    sequence: [
                        {
                            content: 'text: hey\n',
                        },
                    ],
                },
            ],
        }, {
            key: 'utter_uCag8LL6z',
            values: [
                {
                    lang: 'en',
                    sequence: [
                        {
                            content: 'text: bye\n',
                        },
                    ],
                },
            ],
        },
        {
            key: 'utter_J5MMvow26',
            values: [
                {
                    lang: 'en',
                    sequence: [
                        {
                            content: 'text: haha\n',
                        },
                    ],
                },
            ],
        },
    ],
    slots: [
        {
            name: 'disambiguation_message',
            type: 'unfeaturized',
        },
    ],
    forms: {},
};
