import { expect } from 'chai';
import { indexBotResponse } from '../mongo/botResponses';

const textFixture = {
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

const quickReplyFixture = {
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

const customFixture = {
    _id: '5e6940a98300383bea9f3ef1',
    key: 'utter_custom',
    values: [
        {
            lang: 'en',
            sequence: [{ content: '__typename: CustomPayload\ncustom:\n  embedded:\n    title: yeah\n' }],
        },
    ],
    projectId: 'bf',
    textIndex: 'utter_custom\nyeah',
};

const imageFixture = {
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

describe('bot response indexing', () => {
    it('should index a text response', () => {
        const result = indexBotResponse(textFixture);
        expect(result).to.be.equal('utter_Xywmv8uc\nHi i am great, how about you?\ngood! how are you?\nsava, et toi?');
    });
    it('should index a quick reply', () => {
        const result = indexBotResponse(quickReplyFixture);
        expect(result).to.be.equal('utter_tXd-Pm66\nyou can get help with the following:\nwebsite navigation\nnavigation_help\nI have a different question\nhttp://google.com');
    });
    it('should index a custom response', () => {
        const result = indexBotResponse(customFixture);
        expect(result).to.be.equal('utter_custom\nyeah');
    });
    it('should index a image response', () => {
        const result = indexBotResponse(imageFixture);
        expect(result).to.be.equal('utter_0H5XEC9h');
    });
});
