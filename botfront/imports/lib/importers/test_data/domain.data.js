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
        metadata:
          linkTarget: _self
          userInput: hide
          forceOpen: false
          forceClose: true
    utter_aaa:  
      - text: 'aaaa'
        language: 'en'
        metadata:
          linkTarget: _self
          userInput: hide
          forceOpen: true
          forceClose: true
slots:
    fallback_language:
      type: unfeaturized
      initial_value: en
    a_language:
      type: unfeaturized
      initial_value: fr
    test_message:
      type: unfeaturized
forms:
    restaurant_form:
      cuisine:
          - type: from_entity
            entity: cuisine`,
    dataType: 'domain',
};

export const validDomainFr = {
    filename: 'domain.yml',
    rawText:
    `actions:
    - action_aaa
    - action_get_help
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
        metadata:
          linkTarget: _self
          userInput: hide
          forceOpen: false
          forceClose: true
slots:
    fallback_language:
      type: unfeaturized
      initial_value: en
    a_language:
      type: unfeaturized
      initial_value: fr
    test_message:
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
            metadata: {
                forceClose: true,
                forceOpen: false,
                linkTarget: '_self',
                userInput: 'hide',
            },
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
            metadata: {
                forceClose: true,
                forceOpen: true,
                linkTarget: '_self',
                userInput: 'hide',
            },
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
            name: 'test_message',
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


export const validDomainFrParsed = {
    actions: [
        'action_aaa',
        'action_get_help',
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
            metadata: {
                forceClose: true,
                forceOpen: false,
                linkTarget: '_self',
                userInput: 'hide',
            },
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
            name: 'test_message',
            type: 'unfeaturized',
        },
        {
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


export const validDomainsMerged = {
    actions: [
        'action_aaa',
    ],
  
    responses: [
        {
            projectId: 'bf',
            textIndex: 'utter_greet\nSalut!\nHey there!\nЗдравствуйте',
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
            metadata: {
                forceClose: true,
                forceOpen: false,
                linkTarget: '_self',
                userInput: 'hide',
            },
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
            name: 'bla_message',
            type: 'unfeaturized',
        },
        {
            projectId: 'bf',
            name: 'test_message',
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
