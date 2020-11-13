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
    utter_greet:    
      - text: 'Hey there!'
        language: 'en'
    utter_aaa:  
      - text: 'aaaa'
        language: 'en'
slots:
    fallback_language:
      type: unfeaturized
      initial_value: en
    a_language:
      type: unfeaturized
      initial_value: fr
    disambiguation_message:
      type: unfeaturized
forms: {}`,
    dataType: 'domain',
};

export const validDomainFr = {
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
    utter_greet:    
      - text: 'Salut!'
        language: 'fr'
    utter_aaa:  
      - text: 'aaaa'
        language: 'fr'
slots:
    fallback_language:
      type: unfeaturized
      initial_value: en
    a_language:
      type: unfeaturized
      initial_value: fr
    disambiguation_message:
      type: unfeaturized
    bla_message:
      type: unfeaturized
forms:  
    restaurant_form:
      cuisine:
          - type: from_entity
            entity: cuisine`,
    dataType: 'domain',
};

export const validDomainParsed = {
    actions: [
        'action_aaa',
    ],
    responses: [
        {
            key: 'utter_greet',
            values: [
                {
                    lang: 'en',
                    sequence: [
                        {
                            content: 'text: Hey there!\n',
                        },
                    ],
                },
            ],
        }, {
            key: 'utter_aaa',
            values: [
                {
                    lang: 'en',
                    sequence: [
                        {
                            content: 'text: aaaa\n',
                        },
                    ],
                },
            ],
        },
    ],
    slots: [
        {
            name: 'a_language',
            type: 'unfeaturized',
            initialValue: 'fr',
        },
        {
            name: 'disambiguation_message',
            type: 'unfeaturized',
        },
        {
            name: 'bla_message',
            type: 'unfeaturized',
        },
    ],
    forms: {},
};


export const validDomainFrParsed = {
    actions: [
        'action_aaa',
    ],
  
    responses: [
        {
            key: 'utter_greet',
            values: [
                {
                    lang: 'fr',
                    sequence: [
                        {
                            content: 'text: Salut!\n',
                        },
                    ],
                },
            ],
        }, {
            key: 'utter_aaa',
            values: [
                {
                    lang: 'fr',
                    sequence: [
                        {
                            content: 'text: aaaa\n',
                        },
                    ],
                },
            ],
        },
    ],
    slots: [
        {
            name: 'a_language',
            type: 'unfeaturized',
            initialValue: 'fr',
        },
        {
            name: 'disambiguation_message',
            type: 'unfeaturized',
        },
        
    ],
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
};


export const validDomainsMerged = {
    actions: [
        'action_aaa',
    ],
  
    responses: [
        {
            projectId: 'bf',
            textIndex: 'utter_greet\nSalut!\nHey there!',
            key: 'utter_greet',
            values: [
               
                {
                    lang: 'fr',
                    sequence: [
                        {
                            content: 'text: Salut!\n',
                        },
                    ],
                },
                {
                    lang: 'en',
                    sequence: [
                        {
                            content: 'text: Hey there!\n',
                        },
                    ],
                },
                {
                    lang: 'ru',
                    sequence: [
                        {
                            content: 'text: Здравствуйте\n',
                        },
                    ],
                },
            ],
        }, {
            key: 'utter_aaa',
            projectId: 'bf',
            textIndex: 'utter_aaa\naaaa\naaaa',
            values: [
                {
                    lang: 'fr',
                    sequence: [
                        {
                            content: 'text: aaaa\n',
                        },
                    ],
                },
                {
                    lang: 'en',
                    sequence: [
                        {
                            content: 'text: aaaa\n',
                        },
                    ],
                },
                
            ],
        },
    ],
    slots: [
        {
            projectId: 'bf',
            name: 'a_language',
            type: 'unfeaturized',
            initialValue: 'fr',
        },
        {
            projectId: 'bf',
            name: 'disambiguation_message',
            type: 'unfeaturized',
        },
        {
            projectId: 'bf',
            name: 'bla_message',
            type: 'unfeaturized',
        },
    ],
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
};
