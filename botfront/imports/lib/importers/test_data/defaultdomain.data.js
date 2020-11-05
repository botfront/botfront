export const validDefaultDomain = {
    filename: 'default-domain1.yml',
    rawText:
    `slots:
    disambiguation_message:
      type: unfeaturized
actions:
    - action_aaa
    `,
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
    slots:
        {
            disambiguation_message: { type: 'unfeaturized' },
        },
    
    responses: {},
    forms: {},
    actions: [
        'action_aaa',
    ],
};


export const validDefaultDomainParsed2 = {
    slots:
        {
            info_message: { type: 'unfeaturized' },
           
        },
    
  
    responses: {},
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
    responses: {},
    forms: {},
    actions: [
        'action_aaa',
        'action_bbb',
        'action_ccc',
    ],
};
