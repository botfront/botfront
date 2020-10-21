import { expect } from 'chai';
import { getAllResponses } from './story.utils';
import { createResponses } from '../api/graphql/botResponses/mongo/botResponses';


/* to do:
extractDomain
getFragmentsAndDomain
addCheckpoints
*/

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
                        content: 'text: choose\nbuttons:\n  - title: \'Yes\'\n    type: postback\n    payload: \'/I_want_a_shirt{"color":"red"}\'\n  - title: \'No\'\n    type: web_url\n    payload: \'http://google.com\'',
                        __typename: 'ContentContainer',
                    },
                ],
                __typename: 'BotResponseValue',
            },
            {
                lang: 'zz',
                sequence: [
                    {
                        content: 'text: choose\nbuttons:\n  - title: \'Yes\'\n    type: postback\n    payload: \'/I_want_a_shirt{"color":"red"}\'\n  - title: \'No\'\n    type: web_url\n    payload: \'http://google.com\'',
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
            story: 'I\'m at level one',
        },
        {
            title: 'MyLevel1Branch2',
            branches: [
                {
                    title: 'MyLevel2Branch1',
                    branches: [],
                    _id: 'VAcNydTIc',
                    story: 'I\'m at level two',
                },
                {
                    title: 'MyLevel2Branch2',
                    branches: [
                        {
                            title: 'MyLevel3Branch1',
                            branches: [],
                            _id: 'IDY6KreSH',
                            story: 'I\'m at level three',
                        },
                        {
                            title: 'MyLevel3Branch2',
                            branches: [],
                            _id: 'H8JQsW2Wi-',
                            story: 'I\'m at level three',
                        },
                        {
                            title: 'MyLevel3Branch3',
                            branches: [],
                            _id: 'vWGn8wdnA',
                            story: 'I\'m at level three',
                        },
                    ],
                    _id: 'pH8WSjPsYv',
                    story: 'I\'m at level two',
                },
                {
                    title: 'MyLevel2Branch3',
                    branches: [],
                    _id: 'hR5bnFzb3',
                    story: 'I\'m at level two',
                },
            ],
            _id: '3jFsC86Oaz',
            story: 'I\'m at level one',
        },
        {
            title: 'MyLevel1Branch3',
            branches: [],
            _id: 'SRxr9Ebjc',
            story: 'I\'m at level one',
        },
    ],
    story: 'I\'m at the root level',
};

const linkedStoriesFixtures = [
    {
        _id: '9u2SN8ngA39ZgMBM9',
        title: 'story0',
        storyGroupId: '92xatZa5PLBwq2tuT',
        projectId: 'bf',
        branches: [],
        story: 'from 3 to 1',
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
                        story: 'nothing',
                    },
                    {
                        title: 'New Branch 2',
                        branches: [],
                        _id: 'IzZn0TNnpG',
                        story: 'to 2',
                    },
                ],
                _id: 'ddc57mpAC',
                story: 'nothing',
            },
            {
                title: 'New Branch 2',
                branches: [],
                _id: 'z0scMz2Gtt',
                story: 'nothing',
            },
        ],
        checkpoints: [['9u2SN8ngA39ZgMBM9']],
        story: 'from 0',
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
                story: 'to 0',
            },
            {
                title: 'New Branch 2',
                branches: [],
                _id: 'IvMKJCfdrr',
                story: 'to 3',
            },
        ],
        checkpoints: [['CM5Zb6WXAHPRTdzGW', 'ddc57mpAC', 'IzZn0TNnpG']],
        story: 'from 1',
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
                story: 'nothing',
            },
            {
                title: 'New Branch 2',
                branches: [],
                _id: 'pGza9w5cXX',
                story: 'to 0',
            },
        ],
        checkpoints: [['dRmvJg2EQrxtQbFAd', 'IvMKJCfdrr']],
        story: 'from 2',
    },
];

const linkedStoriesCheckpointed = [
    {
        _id: '9u2SN8ngA39ZgMBM9',
        title: 'story0',
        storyGroupId: '92xatZa5PLBwq2tuT',
        projectId: 'bf',
        branches: [],
        story: '> checkpoint_1\n> checkpoint_0\nfrom 3 to 1\n> checkpoint_2',
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
                        story: 'nothing',
                    },
                    {
                        title: 'New Branch 2',
                        branches: [],
                        _id: 'IzZn0TNnpG',
                        story: 'to 2\n> checkpoint_3',
                    },
                ],
                _id: 'ddc57mpAC',
                story: 'nothing',
            },
            {
                title: 'New Branch 2',
                branches: [],
                _id: 'z0scMz2Gtt',
                story: 'nothing',
            },
        ],
        checkpoints: [['9u2SN8ngA39ZgMBM9']],
        story: '> checkpoint_2\nfrom 0',
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
                story: 'to 0\n> checkpoint_1',
            },
            {
                title: 'New Branch 2',
                branches: [],
                _id: 'IvMKJCfdrr',
                story: 'to 3\n> checkpoint_4',
            },
        ],
        checkpoints: [['CM5Zb6WXAHPRTdzGW', 'ddc57mpAC', 'IzZn0TNnpG']],
        story: '> checkpoint_3\nfrom 1',
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
                story: 'nothing',
            },
            {
                title: 'New Branch 2',
                branches: [],
                _id: 'pGza9w5cXX',
                story: 'to 0\n> checkpoint_0',
            },
        ],
        checkpoints: [['dRmvJg2EQrxtQbFAd', 'IvMKJCfdrr']],
        story: '> checkpoint_4\nfrom 2',
    },
];

const checkpointedStory = {
    _id: 'n6ArDvmf7PEBrZ4ph',
    title: 'MyRootStory',
    projectId: 'TZjfxMi4jHALBQ5s4',
    storyGroupId: 'vWibRMnEe6B6nSWMm',
    branches: [
        {
            title: 'MyRootStory__MyLevel1Branch1',
            branches: [],
            _id: 'u8fUQytlr',
            story: '> MyRootStory__branches\nI\'m at level one',
        },
        {
            title: 'MyRootStory__MyLevel1Branch2',
            branches: [
                {
                    title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch1',
                    branches: [],
                    _id: 'VAcNydTIc',
                    story: '> MyRootStory__MyLevel1Branch2__branches\nI\'m at level two',
                },
                {
                    title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2',
                    branches: [
                        {
                            title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__MyLevel3Branch1',
                            branches: [],
                            _id: 'IDY6KreSH',
                            story: '> MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches\nI\'m at level three',
                        },
                        {
                            title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__MyLevel3Branch2',
                            branches: [],
                            _id: 'H8JQsW2Wi-',
                            story: '> MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches\nI\'m at level three',
                        },
                        {
                            title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch2__MyLevel3Branch3',
                            branches: [],
                            _id: 'vWGn8wdnA',
                            story: '> MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches\nI\'m at level three',
                        },
                    ],
                    _id: 'pH8WSjPsYv',
                    story: '> MyRootStory__MyLevel1Branch2__branches\nI\'m at level two\n> MyRootStory__MyLevel1Branch2__MyLevel2Branch2__branches',
                },
                {
                    title: 'MyRootStory__MyLevel1Branch2__MyLevel2Branch3',
                    branches: [],
                    _id: 'hR5bnFzb3',
                    story: '> MyRootStory__MyLevel1Branch2__branches\nI\'m at level two',
                },
            ],
            _id: '3jFsC86Oaz',
            story: '> MyRootStory__branches\nI\'m at level one\n> MyRootStory__MyLevel1Branch2__branches',
        },
        {
            title: 'MyRootStory__MyLevel1Branch3',
            branches: [],
            _id: 'SRxr9Ebjc',
            story: '> MyRootStory__branches\nI\'m at level one',
        },
    ],
    story: 'I\'m at the root level\n> MyRootStory__branches',
};

if (Meteor.isServer) {
    before(async () => {
        import { connectToDb } from '../startup/server/apollo.js';

        connectToDb();
        await createResponses('test', responseFixture);
    });
}

describe('proper appending of checkpoints to branching story', function() {
    it('should output something matching the gold', function() {
        expect((a => a)(storyFixture)).to.be.deep.equal(checkpointedStory);
    });
});

describe('proper addition of checkpoints to linked stories', function() {
    it('should output an object matching the control object with correct checkpoints', function() {
        expect((a => a)(linkedStoriesFixtures)).to.be.deep.equal(
            linkedStoriesCheckpointed,
        );
    });
});

if (Meteor.isServer) {
    describe('getAllResponses', () => {
        it('fetch English responses', async () => {
            const response = await getAllResponses('test', 'en');
            expect(response).to.be.deep.equal(
                responsesExported.en,
            );
        });
        it('fetch ZZ responses', async () => {
            const response = await getAllResponses('test', 'zz');
            expect(response).to.be.deep.equal(
                responsesExported.zz,
            );
        });
        it('fetch English and ZZ responses', async () => {
            const response = await getAllResponses('test', ['en', 'zz']);
            expect(response).to.be.deep.equal(
                responsesExported['en-zz'],
            );
        });
        it('fetch all responses', async () => {
            const response = await getAllResponses('test');
            expect(response).to.be.deep.equal(
                responsesExported['en-zz'],
            );
        });
        it('fetch no responses', async () => {
            const response = await getAllResponses('test', 'nonexisting');
            expect(response).to.be.deep.equal({});
        });
    });
}
