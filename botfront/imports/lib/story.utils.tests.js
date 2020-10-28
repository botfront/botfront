import { expect } from 'chai';
import {
    getAllResponses,
    addCheckpoints,
    extractDomain,
    stringPayloadToObject,
    objectPayloadToString,
} from './story.utils';
import { createResponses } from '../api/graphql/botResponses/mongo/botResponses';

const responseFixture = [
    {
        _id: '5deeb6e7bfecbd207f6f73ea',
        key: 'utter_do_you_like_beans',
        values: [
            {
                lang: 'en',
                sequence: [
                    {
                        content: 'text: Do you like beans?\n',
                        __typename: 'ContentContainer',
                    },
                ],
                __typename: 'BotResponseValue',
            },
            {
                lang: 'zz',
                sequence: [
                    {
                        content: 'text: Do you like beans?\n',
                        __typename: 'ContentContainer',
                    },
                ],
                __typename: 'BotResponseValue',
            },
        ],
        __typename: 'BotResponse',
    },
    {
        _id: '5df13744e8036c83aa1aa745',
        key: 'utter_XHEzYD8j',
        values: [
            {
                lang: 'en',
                sequence: [
                    {
                        content:
                            'text: choose\nbuttons:\n  - title: \'Yes\'\n    type: postback\n    payload: \'/I_want_a_shirt{"color":"red"}\'\n  - title: \'No\'\n    type: web_url\n    payload: \'http://google.com\'',
                        __typename: 'ContentContainer',
                    },
                ],
                __typename: 'BotResponseValue',
            },
            {
                lang: 'zz',
                sequence: [
                    {
                        content:
                            'text: choose\nbuttons:\n  - title: \'Yes\'\n    type: postback\n    payload: \'/I_want_a_shirt{"color":"red"}\'\n  - title: \'No\'\n    type: web_url\n    payload: \'http://google.com\'',
                        __typename: 'ContentContainer',
                    },
                ],
                __typename: 'BotResponseValue',
            },
        ],
        __typename: 'BotResponse',
    },
];

const responsesExported = {
    en: {
        utter_XHEzYD8j: [
            {
                text: 'choose',
                buttons: [
                    {
                        title: 'Yes',
                        type: 'postback',
                        payload: '/I_want_a_shirt{"color":"red"}',
                    },
                    {
                        title: 'No',
                        type: 'web_url',
                        payload: 'http://google.com',
                    },
                ],
                language: 'en',
            },
        ],
        utter_do_you_like_beans: [
            {
                text: 'Do you like beans?',
                language: 'en',
            },
        ],
    },
    zz: {
        utter_XHEzYD8j: [
            {
                text: 'choose',
                buttons: [
                    {
                        title: 'Yes',
                        type: 'postback',
                        payload: '/I_want_a_shirt{"color":"red"}',
                    },
                    {
                        title: 'No',
                        type: 'web_url',
                        payload: 'http://google.com',
                    },
                ],
                language: 'zz',
            },
        ],
        utter_do_you_like_beans: [
            {
                text: 'Do you like beans?',
                language: 'zz',
            },
        ],
    },
    'en-zz': {
        utter_XHEzYD8j: [
            {
                text: 'choose',
                buttons: [
                    {
                        title: 'Yes',
                        type: 'postback',
                        payload: '/I_want_a_shirt{"color":"red"}',
                    },
                    {
                        title: 'No',
                        type: 'web_url',
                        payload: 'http://google.com',
                    },
                ],
                language: 'en',
            },
            {
                text: 'choose',
                buttons: [
                    {
                        title: 'Yes',
                        type: 'postback',
                        payload: '/I_want_a_shirt{"color":"red"}',
                    },
                    {
                        title: 'No',
                        type: 'web_url',
                        payload: 'http://google.com',
                    },
                ],
                language: 'zz',
            },
        ],
        utter_do_you_like_beans: [
            {
                text: 'Do you like beans?',
                language: 'en',
            },
            {
                text: 'Do you like beans?',
                language: 'zz',
            },
        ],
    },
};

const storyFixture = {
    _id: 'n6ArDvmf7PEBrZ4ph',
    title: 'MyRootStory',
    projectId: 'TZjfxMi4jHALBQ5s4',
    storyGroupId: 'vWibRMnEe6B6nSWMm',
    branches: [
        {
            title: 'MyLevel1Branch1',
            branches: [],
            _id: 'u8fUQytlr',
            steps: [{ action: 'utter_levelOne' }],
        },
        {
            title: 'MyLevel1Branch2',
            branches: [
                {
                    title: 'MyLevel2Branch1',
                    branches: [],
                    _id: 'VAcNydTIc',
                    steps: [
                        { intent: 'greeting', entities: [{ name: 'joe' }] },
                        { action: 'utter_levelTwo' },
                    ],
                },
                {
                    title: 'MyLevel2Branch2',
                    branches: [
                        {
                            title: 'MyLevel3Branch1',
                            branches: [],
                            _id: 'IDY6KreSH',
                            steps: [{ action: 'utter_levelThree' }],
                        },
                        {
                            title: 'MyLevel3Branch2',
                            branches: [],
                            _id: 'H8JQsW2Wi-',
                            steps: [{ action: 'utter_levelThree' }],
                        },
                        {
                            title: 'MyLevel3Branch3',
                            branches: [],
                            _id: 'vWGn8wdnA',
                            steps: [{ action: 'utter_levelThree' }],
                        },
                    ],
                    _id: 'pH8WSjPsYv',
                    steps: [{ action: 'utter_levelTwo' }],
                },
                {
                    title: 'MyLevel2Branch3',
                    branches: [],
                    _id: 'hR5bnFzb3',
                    steps: [{ action: 'utter_levelTwo' }],
                },
            ],
            _id: '3jFsC86Oaz',
            steps: [{ action: 'utter_levelOne' }],
        },
        {
            title: 'MyLevel1Branch3',
            branches: [],
            _id: 'SRxr9Ebjc',
            steps: [{ action: 'utter_levelOne' }],
        },
    ],
    steps: [{ action: 'utter_levelZero' }],
};

const checkpointedStories = [
    {
        title: 'MyRootStory',
        projectId: 'TZjfxMi4jHALBQ5s4',
        storyGroupId: 'vWibRMnEe6B6nSWMm',
        steps: [{ action: 'utter_levelZero' }, { checkpoint: 'MyRootStory__branches' }],
    },
    {
        title: 'MyRootStory__MyLevel1Branch1',
        steps: [{ checkpoint: 'MyRootStory__branches' }, { action: 'utter_levelOne' }],
    },
    {
        title: 'MyRootStory__MyLevel1Branch2',
        steps: [
            { checkpoint: 'MyRootStory__branches' },
            { action: 'utter_levelOne' },
            { checkpoint: 'MyRootStory__MyLevel1Branch2__branches' },
        ],
    },
    {
        title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch1',
        steps: [
            { checkpoint: 'MyRootStory__MyLevel1Branch2__branches' },
            { intent: 'greeting', entities: [{ name: 'joe' }] },
            { action: 'utter_levelTwo' },
        ],
    },
    {
        title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2',
        steps: [
            { checkpoint: 'MyRootStory__MyLevel1Branch2__branches' },
            { action: 'utter_levelTwo' },
            {
                checkpoint: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches',
            },
        ],
    },
    {
        title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__MyLevel3Branch1',
        steps: [
            {
                checkpoint: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches',
            },
            { action: 'utter_levelThree' },
        ],
    },
    {
        title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__MyLevel3Branch2',
        steps: [
            {
                checkpoint: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches',
            },
            { action: 'utter_levelThree' },
        ],
    },
    {
        title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__MyLevel3Branch3',
        steps: [
            {
                checkpoint: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches',
            },
            { action: 'utter_levelThree' },
        ],
    },
    {
        title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch3',
        steps: [
            { checkpoint: 'MyRootStory__MyLevel1Branch2__branches' },
            { action: 'utter_levelTwo' },
        ],
    },
    {
        title: 'MyRootStory__MyLevel1Branch3',
        steps: [{ checkpoint: 'MyRootStory__branches' }, { action: 'utter_levelOne' }],
    },
];

const linkedStoriesFixtures = [
    {
        _id: '9u2SN8ngA39ZgMBM9',
        title: 'story0',
        storyGroupId: '92xatZa5PLBwq2tuT',
        projectId: 'bf',
        branches: [],
        steps: [{ action: 'utter_from3to1' }],
        checkpoints: [
            ['qb2jnTi4hC5xS9uER', 'pGza9w5cXX'],
            ['dRmvJg2EQrxtQbFAd', 'ibH7J2d4a'],
        ],
    },
    {
        _id: 'CM5Zb6WXAHPRTdzGW',
        title: 'story1',
        projectId: 'bf',
        storyGroupId: '92xatZa5PLBwq2tuT',
        branches: [
            {
                title: 'New Branch 1',
                branches: [
                    {
                        title: 'New Branch 1',
                        branches: [],
                        _id: 'ySg1XPqzS',
                        steps: [{ action: 'utter_nothing' }],
                    },
                    {
                        title: 'New Branch 2',
                        branches: [],
                        _id: 'IzZn0TNnpG',
                        steps: [{ action: 'utter_to2' }],
                    },
                ],
                _id: 'ddc57mpAC',
                steps: [{ action: 'utter_nothing' }],
            },
            {
                title: 'New Branch 2',
                branches: [],
                _id: 'z0scMz2Gtt',
                steps: [{ action: 'utter_nothing' }],
            },
        ],
        checkpoints: [['9u2SN8ngA39ZgMBM9']],
        steps: [{ action: 'utter_from0' }],
    },
    {
        _id: 'dRmvJg2EQrxtQbFAd',
        title: 'story2',
        projectId: 'bf',
        storyGroupId: '92xatZa5PLBwq2tuT',
        branches: [
            {
                title: 'New Branch 1',
                branches: [],
                _id: 'ibH7J2d4a',
                steps: [{ action: 'utter_to0' }],
            },
            {
                title: 'New Branch 2',
                branches: [],
                _id: 'IvMKJCfdrr',
                steps: [{ action: 'utter_to3' }],
            },
        ],
        checkpoints: [['CM5Zb6WXAHPRTdzGW', 'ddc57mpAC', 'IzZn0TNnpG']],
        steps: [{ action: 'utter_from1' }],
    },
    {
        _id: 'qb2jnTi4hC5xS9uER',
        title: 'story3',
        storyGroupId: '69PLEAAXxxQfekhsS',
        projectId: 'bf',
        branches: [
            {
                title: 'New Branch 1',
                branches: [],
                _id: 'v5oXJB7b4',
                steps: [{ action: 'utter_nothing' }],
            },
            {
                title: 'New Branch 2',
                branches: [],
                _id: 'pGza9w5cXX',
                steps: [{ action: 'utter_to0' }],
            },
        ],
        checkpoints: [['dRmvJg2EQrxtQbFAd', 'IvMKJCfdrr']],
        steps: [{ action: 'utter_from2' }],
    },
];

const linkedStoriesCheckpointed = [
    {
        title: 'story0',
        storyGroupId: '92xatZa5PLBwq2tuT',
        projectId: 'bf',
        steps: [
            { checkpoint: 'link-to-story0/9u2SN8ngA39ZgMBM9' },
            { action: 'utter_from3to1' },
            { checkpoint: 'link-to-story1/CM5Zb6WXAHPRTdzGW' },
        ],
    },
    {
        title: 'story1',
        projectId: 'bf',
        storyGroupId: '92xatZa5PLBwq2tuT',
        steps: [
            { checkpoint: 'link-to-story1/CM5Zb6WXAHPRTdzGW' },
            { action: 'utter_from0' },
            { checkpoint: 'story1__branches' },
        ],
    },
    {
        title: 'story1__New Branch 1',
        steps: [
            { checkpoint: 'story1__branches' },
            { action: 'utter_nothing' },
            { checkpoint: 'story1__New_Branch_1__branches' },
        ],
    },
    {
        title: 'story1__New Branch 1__New Branch 1',
        steps: [
            { checkpoint: 'story1__New_Branch_1__branches' },
            { action: 'utter_nothing' },
        ],
    },
    {
        title: 'story1__New Branch 1__New Branch 2',
        steps: [
            { checkpoint: 'story1__New_Branch_1__branches' },
            { action: 'utter_to2' },
            { checkpoint: 'link-to-story2/dRmvJg2EQrxtQbFAd' },
        ],
    },
    {
        title: 'story1__New Branch 2',
        steps: [{ checkpoint: 'story1__branches' }, { action: 'utter_nothing' }],
    },
    {
        title: 'story2',
        projectId: 'bf',
        storyGroupId: '92xatZa5PLBwq2tuT',
        steps: [
            { checkpoint: 'link-to-story2/dRmvJg2EQrxtQbFAd' },
            { action: 'utter_from1' },
            { checkpoint: 'story2__branches' },
        ],
    },
    {
        title: 'story2__New Branch 1',
        steps: [
            { checkpoint: 'story2__branches' },
            { action: 'utter_to0' },
            { checkpoint: 'link-to-story0/9u2SN8ngA39ZgMBM9' },
        ],
    },
    {
        title: 'story2__New Branch 2',
        steps: [
            { checkpoint: 'story2__branches' },
            { action: 'utter_to3' },
            { checkpoint: 'link-to-story3/qb2jnTi4hC5xS9uER' },
        ],
    },
    {
        title: 'story3',
        storyGroupId: '69PLEAAXxxQfekhsS',
        projectId: 'bf',
        steps: [
            { checkpoint: 'link-to-story3/qb2jnTi4hC5xS9uER' },
            { action: 'utter_from2' },
            { checkpoint: 'story3__branches' },
        ],
    },
    {
        title: 'story3__New Branch 1',
        steps: [{ checkpoint: 'story3__branches' }, { action: 'utter_nothing' }],
    },
    {
        title: 'story3__New Branch 2',
        steps: [
            { checkpoint: 'story3__branches' },
            { action: 'utter_to0' },
            { checkpoint: 'link-to-story0/9u2SN8ngA39ZgMBM9' },
        ],
    },
];

if (Meteor.isServer) {
    before(async () => {
        import { connectToDb } from '../startup/server/apollo.js';

        connectToDb();
        await createResponses('test', responseFixture);
    });

    describe('proper appending of checkpoints', function () {
        it('should should render branches as checkpoints', function () {
            expect(addCheckpoints([storyFixture])).to.be.deep.equal(checkpointedStories);
        });
        it('should render links as checkpoints', function () {
            expect(addCheckpoints(linkedStoriesFixtures)).to.be.deep.equal(
                linkedStoriesCheckpointed,
            );
        });
    });

    describe('domain extraction', function () {
        it('should extract domain', async function () {
            const responses = await getAllResponses('test', 'en');
            expect(
                extractDomain({ fragments: checkpointedStories, responses }),
            ).to.be.deep.equal({
                actions: [
                    'utter_do_you_like_beans',
                    'utter_XHEzYD8j',
                    'utter_levelZero',
                    'utter_levelOne',
                    'utter_levelTwo',
                    'utter_levelThree',
                ],
                intents: ['greeting'],
                entities: ['name'],
                responses,
                slots: {},
                forms: {},
            });
        });
    });

    describe('getAllResponses', () => {
        it('fetch English responses', async () => {
            const response = await getAllResponses('test', 'en');
            expect(response).to.be.deep.equal(responsesExported.en);
        });
        it('fetch ZZ responses', async () => {
            const response = await getAllResponses('test', 'zz');
            expect(response).to.be.deep.equal(responsesExported.zz);
        });
        it('fetch English and ZZ responses', async () => {
            const response = await getAllResponses('test', ['en', 'zz']);
            expect(response).to.be.deep.equal(responsesExported['en-zz']);
        });
        it('fetch all responses', async () => {
            const response = await getAllResponses('test');
            expect(response).to.be.deep.equal(responsesExported['en-zz']);
        });
        it('fetch no responses', async () => {
            const response = await getAllResponses('test', 'nonexisting');
            expect(response).to.be.deep.equal({});
        });
    });

    describe('Story validation', function () {
        it('should convert an intent string payload', function () {
            expect(stringPayloadToObject('/hello')).to.be.deep.equal({
                intent: 'hello',
                entities: [],
            });
        });

        it('should convert an intent/entity string payload', function () {
            expect(stringPayloadToObject('/hello{"ent1":"val1"}')).to.be.deep.equal({
                intent: 'hello',
                entities: [{ entity: 'ent1', value: 'val1' }],
            });
        });

        it('should convert an intent/entities string payload', function () {
            expect(
                stringPayloadToObject('/hello{"ent1":"val1", "ent2":"val2"}'),
            ).to.be.deep.equal({
                intent: 'hello',
                entities: [
                    { entity: 'ent1', value: 'val1' },
                    { entity: 'ent2', value: 'val2' },
                ],
            });
        });

        it('should convert an empty payload', function () {
            expect(stringPayloadToObject('')).to.be.deep.equal({
                entities: [],
                intent: '',
            });
        });

        it('should convert an intent/entities string payload', function () {
            expect(
                stringPayloadToObject('/hello{"ent1":"val1", "ent2":"val2"}'),
            ).to.be.deep.equal({
                intent: 'hello',
                entities: [
                    { entity: 'ent1', value: 'val1' },
                    { entity: 'ent2', value: 'val2' },
                ],
            });
        });

        it('should convert an object to a string payload', function () {
            expect(
                objectPayloadToString({
                    intent: 'hello',
                    entities: [
                        { entity: 'ent1', value: 'val1' },
                        { entity: 'ent2', value: 'val2' },
                    ],
                }),
            ).to.be.equal('/hello{"ent1":"val1","ent2":"val2"}');
        });

        it('should convert an object to a string payload', function () {
            expect(
                objectPayloadToString({
                    intent: 'hello',
                }),
            ).to.be.equal('/hello');
        });

        it('should convert an object to a string payload', function () {
            expect(
                objectPayloadToString({
                    intent: 'hello',
                    entities: [],
                }),
            ).to.be.equal('/hello');
        });
    });
}
