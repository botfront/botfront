export const validIncoming = {
    filename: 'incomingtest.yml',
    rawText:
    `[
        {
          "_id": "6ffea22a-d9ae-4bcf-b445-98b1715ac341",
          "env": "development",
          "language": "en",
          "projectId": "bf",
          "text": "hey",
          "__v": 0,
          "confidence": 1,
          "createdAt": "2020-10-29T16:14:05.275Z",
          "entities": [],
          "intent": "chitchat.greet",
          "updatedAt": "2020-10-29T16:27:33.597Z"
        },
        {
          "_id": "b806859d-a265-4dc0-8758-7ae373be813f",
          "env": "development",
          "language": "en",
          "projectId": "bf",
          "text": "hello",
          "__v": 0,
          "confidence": 1,
          "createdAt": "2020-10-29T16:27:25.716Z",
          "entities": [],
          "intent": "chitchat.greet",
          "updatedAt": "2020-10-29T16:27:33.222Z"
        }
      ]`,
    dataType: 'incoming',
};

export const validIncomingParsed = [
    {
        _id: '6ffea22a-d9ae-4bcf-b445-98b1715ac341',
        env: 'development',
        language: 'en',
        projectId: 'bf',
        text: 'hey',
        __v: 0,
        confidence: 1,
        createdAt: '2020-10-29T16:14:05.275Z',
        entities: [],
        intent: 'chitchat.greet',
        updatedAt: '2020-10-29T16:27:33.597Z',
    },
    {
        _id: 'b806859d-a265-4dc0-8758-7ae373be813f',
        env: 'development',
        language: 'en',
        projectId: 'bf',
        text: 'hello',
        __v: 0,
        confidence: 1,
        createdAt: '2020-10-29T16:27:25.716Z',
        entities: [],
        intent: 'chitchat.greet',
        updatedAt: '2020-10-29T16:27:33.222Z',
    },
];
