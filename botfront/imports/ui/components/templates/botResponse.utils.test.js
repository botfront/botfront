import { expect } from 'chai';
import { checkResponseEmpty } from './botResponse.utils';

const validTextResponse = {
    _id: '5dfa5b1ac0893470b7356575',
    key: 'utter_j3WZr8_b',
    values: [{ lang: 'en', sequence: [{ content: 'text: hello this is a response\n' }] }],
    projectId: 'bf',
};

const emptyTextResponse = {
    _id: '5dfa5be606bfd271647d9ccb',
    key: 'utter_RECgXMsG',
    values: [{ lang: 'en', sequence: [{ content: 'text: \'\'\n' }] }],
    projectId: 'bf',
};

const validQuickReply = {
    _id: '5dfa5c4606bfd271647d9ccc',
    key: 'utter_mcQ7BoHh',
    values: [
        {
            lang: 'en',
            sequence: [
                {
                    content:
                        'text: hello\nbuttons:\n  - title: button one\n    type: postback\n    payload: /chitchat.bye\n  - title: button two\n    type: postback\n    payload: /chitchat.greet\n',
                },
            ],
        },
    ],
    projectId: 'bf',
};

const emptyQuickReply = {
    _id: '5dfa5c4606bfd271647d9ccc',
    key: 'utter_mcQ7BoHh',
    values: [
        {
            lang: 'en',
            sequence: [
                {
                    content:
                        'text: \'\'\nbuttons:\n  - title: \'\'\n    type: postback\n    payload: \'\'\n',
                },
            ],
        },
    ],
    projectId: 'bf',
};


describe('Empty bot responses', () => {
    it('should correctly identify empty text responses', () => {
        expect(checkResponseEmpty(validTextResponse)).to.equal(false);
        expect(checkResponseEmpty(emptyTextResponse)).to.equal(true);
    });
    it('should correctly identify empty quick replies', () => {
        expect(checkResponseEmpty(validQuickReply)).to.equal(false);
        expect(checkResponseEmpty(emptyQuickReply)).to.equal(true);
    });
});
