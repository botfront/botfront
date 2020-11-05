export const validDefaultDomain = {
    filename: 'default-domain.yml',
    rawText:
    `slots:
    disambiguation_message:
      type: unfeaturized
actions:
    - action_aaa
    `,
    dataType: 'defaultdomain',
};

export const validDefaultDomainParsed = {
    slots: [
        {
            name: 'disambiguation_message',
            type: 'unfeaturized',
        },
    ],
  
    responses: [],
    forms: {},
    actions: [
        'action_aaa',
    ],
};
