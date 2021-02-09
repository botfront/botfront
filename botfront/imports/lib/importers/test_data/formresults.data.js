export const validFormResults = {
    filename: 'formresults.development.yml',
    rawText:
    `[
        {
          "_id": "5fca43ba929a6e23879d8a91",
          "language": "en",
          "conversationId": "56a6510b5f7b4cf98debdee873ba413e",
          "formName": "Examplegroup_form",
          "latestInputChannel": "webchat",
          "results": {
            "test": "ahahahah"
          },
          "environment": "development",
          "projectId": "bf",
          "date": "2020-12-04T14:12:10.091Z"
        },
        {
          "_id": "5fca43be929a6e23879d8a92",
          "language": "en",
          "conversationId": "776d5191fcc348688ab1b80b27822130",
          "formName": "Examplegroup_form",
          "latestInputChannel": "webchat",
          "results": {
            "test": "ohohohoh"
          },
          "environment": "development",
          "projectId": "bf",
          "date": "2020-12-04T14:12:14.724Z"
        }
      ]`,
    dataType: 'formresults',
};

export const validFormResultsParsed = [
    {
        _id: '5fca43ba929a6e23879d8a91',
        language: 'en',
        conversationId: '56a6510b5f7b4cf98debdee873ba413e',
        formName: 'Examplegroup_form',
        latestInputChannel: 'webchat',
        results: {
            test: 'ahahahah',
        },
        environment: 'development',
        projectId: 'bf',
        date: '2020-12-04T14:12:10.091Z',
    },
    {
        _id: '5fca43be929a6e23879d8a92',
        language: 'en',
        conversationId: '776d5191fcc348688ab1b80b27822130',
        formName: 'Examplegroup_form',
        latestInputChannel: 'webchat',
        results: {
            test: 'ohohohoh',
        },
        environment: 'development',
        projectId: 'bf',
        date: '2020-12-04T14:12:14.724Z',
    },
];
