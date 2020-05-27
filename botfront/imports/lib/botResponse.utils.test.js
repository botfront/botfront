import { expect } from 'chai';
import { checkResponseEmpty } from './botResponse.utils';

// ------------------------
const responseWithName = {
    _id: '5e3c30be5c3ded81e91e0eee',
    key: 'utter_a',
    values: [
        { lang: 'en', sequence: [{ content: 'text: \'\'\n__typename: TextPayload\n' }] },
    ],
    projectId: 'bf',
};
const responseWithMetadata = {
    _id: '5e3c32ac5c3ded81e91e0ef7',
    key: 'utter_qwer',
    values: [{ lang: 'en', sequence: [{ content: 'text: \'\'\n' }] }],
    metadata: {
        linkTarget: '_blank',
        userInput: 'show',
        pageChangeCallbacks: null,
        forceOpen: true,
        forceClose: false,
    },
    projectId: 'bf',
};
const textEmpty = {
    _id: '5e3c30be5c3ded81e91e0eee',
    key: 'utter_',
    values: [
        { lang: 'en', sequence: [{ content: 'text: \'\'\n__typename: TextPayload\n' }] },
    ],
    projectId: 'bf',
};
const textWithContent = {
    _id: '5e3c30d55c3ded81e91e0ef2',
    key: 'utter_',
    values: [
        { lang: 'en', sequence: [{ content: '__typename: TextPayload\ntext: q\n' }] },
    ],
    projectId: 'bf',
};

const qrEmpty = {
    _id: '5e3c30c05c3ded81e91e0eef',
    key: 'utter_',
    values: [
        {
            lang: 'en',
            sequence: [
                {
                    content:
                        '__typename: QuickRepliesPayload\ntext: \'\'\nbuttons:\n  - title: \'\'\n    type: postback\n    payload: \'\'\n',
                },
            ],
        },
    ],
    projectId: 'bf',
};
const qrWithText = {
    _id: '5e3c30dd5c3ded81e91e0ef3',
    key: 'utter_',
    values: [
        {
            lang: 'en',
            sequence: [
                {
                    content:
                        '__typename: QuickRepliesPayload\ntext: q\nbuttons:\n  - title: \'test\'\n    type: postback\n    payload: \'\'\n',
                },
            ],
        },
    ],
    projectId: 'bf',
};
const qrWithButton = {
    _id: '5e3c30ef5c3ded81e91e0ef4',
    key: 'utter_',
    values: [
        {
            lang: 'en',
            sequence: [
                {
                    content:
                        '__typename: QuickRepliesPayload\ntext: \'\'\nbuttons:\n  - title: q\n    type: postback\n    payload: /chitchat.greet\n    __typename: PostbackButton\n',
                },
            ],
        },
    ],
    projectId: 'bf',
};

const imageEmpty = {
    _id: '5e3c30c55c3ded81e91e0ef0',
    key: 'utter_',
    values: [
        {
            lang: 'en',
            sequence: [{ content: 'image: \'\'\n__typename: ImagePayload\ntext: \'\'\n' }],
        },
    ],
    projectId: 'bf',
};
const imageWithUrl = {
    _id: '5e3c30fc5c3ded81e91e0ef5',
    key: 'utter_',
    values: [
        {
            lang: 'en',
            sequence: [{ content: 'image: q\n__typename: ImagePayload\ntext: \'\'\n' }],
        },
    ],
    projectId: 'bf',
};
const customEmpty = {
    _id: '5e3c30ca5c3ded81e91e0ef1',
    key: 'utter_',
    values: [{ lang: 'en', sequence: [{ content: '__typename: CustomPayload\n' }] }],
    projectId: 'bf',
};
const customWithContent = {
    _id: '5e3c31085c3ded81e91e0ef6',
    key: 'utter_',
    values: [
        { lang: 'en', sequence: [{ content: '__typename: CustomPayload\ncustom: r\n' }] },
    ],
    projectId: 'bf',
};
// ------------------------

describe('Empty bot responses', () => {
    it('should recognize responses with a name or metadata as not empty', () => {
        expect(checkResponseEmpty(responseWithName)).to.equal(false);
        expect(checkResponseEmpty(responseWithMetadata)).to.equal(false);
    });
    it('should correctly identify empty text responses', () => {
        expect(checkResponseEmpty(textEmpty)).to.equal(true);
        expect(checkResponseEmpty(textWithContent)).to.equal(false);
    });
    it('should correctly identify empty quick replies', () => {
        expect(checkResponseEmpty(qrEmpty)).to.equal(true);
        expect(checkResponseEmpty(qrWithText)).to.equal(false);
        expect(checkResponseEmpty(qrWithButton)).to.equal(false);
    });
    it('should correctly identify empty images responses', () => {
        expect(checkResponseEmpty(imageEmpty)).to.equal(true);
        expect(checkResponseEmpty(imageWithUrl)).to.equal(false);
    });
    it('should correctly identify empty custom responses', () => {
        expect(checkResponseEmpty(customEmpty)).to.equal(true);
        expect(checkResponseEmpty(customWithContent)).to.equal(false);
    });
});
