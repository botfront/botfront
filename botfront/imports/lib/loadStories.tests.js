import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import {
    parseStoryGroup, parseStoryGroups, generateStories,
} from './loadStories';

const storyGroupOne = [
    `## Farewells
> checkpoint_1
> checkpoint_0

> checkpoint_2`,
    `## Get started
* get_started
  - utter_get_started
> Get_started__branches`,
    `## Get started__New Branch 1
> Get_started__branches`,
    `## Get started__New Branch 2
<!-- hey this one is a multiline
        comment  -->
> Get_started__branches

> Get_started__New_Branch_2__branches`,
    `## Get started__New Branch 2__New Branch 1
> Get_started__New_Branch_2__branches

> checkpoint_1`,
    `## Get started__New Branch 2__New Branch 2
> Get_started__New_Branch_2__branches

> checkpoint_0`,
];

const storyGroupTwo = [
    `## Greetings
> checkpoint_2
* chitchat.greet
  - utter_hi`,
];

const badStories = [
    `## Sandwich
* intent_1
> checkpoint_1
* intent_2`,
    `## Mismatched mother__child
> Another_mothers__branches
* intent_1`,
    `## Mother__child
> Mother__branches
> Mother__branches
* intent_1`,
    `## Multiple destinations
* intent_1
> one
> two`,
    `## Mismatched child
* intent_1
> Another_names__branches`,
];

const storyGroups = [
    { name: 'storyGroupOne', rawText: storyGroupOne.join('\n'), _id: '123' },
    { name: 'storyGroupTwo', rawText: storyGroupTwo.join('\n'), _id: '456' },
];

const storyGroupOneParsed = [
    {
        storyGroupId: '123',
        title: 'Farewells',
        fullTitle: 'Farewells',
        ancestorOf: [],
        linkFrom: ['checkpoint_1', 'checkpoint_0'],
        hasDescendents: false,
        linkTo: 'checkpoint_2',
        body: '',
    },
    {
        storyGroupId: '123',
        title: 'Get started',
        fullTitle: 'Get started',
        ancestorOf: [],
        linkFrom: [],
        hasDescendents: true,
        linkTo: null,
        body: '* get_started\n  - utter_get_started',
    },
    {
        storyGroupId: '123',
        title: 'New Branch 1',
        fullTitle: 'Get started__New Branch 1',
        ancestorOf: ['Get_started'],
        linkFrom: [],
        hasDescendents: false,
        linkTo: null,
        body: '',
    },
    {
        storyGroupId: '123',
        title: 'New Branch 2',
        fullTitle: 'Get started__New Branch 2',
        ancestorOf: ['Get_started'],
        linkFrom: [],
        hasDescendents: true,
        linkTo: null,
        body: '',
    },
    {
        storyGroupId: '123',
        title: 'New Branch 1',
        fullTitle: 'Get started__New Branch 2__New Branch 1',
        ancestorOf: ['Get_started', 'New_Branch_2'],
        linkFrom: [],
        hasDescendents: false,
        linkTo: 'checkpoint_1',
        body: '',
    },
    {
        storyGroupId: '123',
        title: 'New Branch 2',
        fullTitle: 'Get started__New Branch 2__New Branch 2',
        ancestorOf: ['Get_started', 'New_Branch_2'],
        linkFrom: [],
        hasDescendents: false,
        linkTo: 'checkpoint_0',
        body: '',
    },
];

const storyGroupTwoParsed = [
    {
        storyGroupId: '456',
        title: 'Greetings',
        fullTitle: 'Greetings',
        ancestorOf: [],
        linkFrom: ['checkpoint_2'],
        hasDescendents: false,
        linkTo: null,
        body: '* chitchat.greet\n  - utter_hi',
    },
];

const storiesGenerated = [
    {
        story: '',
        title: 'Farewells',
        storyGroupId: '123',
    },
    {
        story: '* get_started\n  - utter_get_started',
        title: 'Get started',
        storyGroupId: '123',
        branches: [
            { story: '', title: 'New Branch 1' },
            {
                story: '',
                title: 'New Branch 2',
                branches: [
                    { story: '', title: 'New Branch 1' },
                    { story: '', title: 'New Branch 2' },
                ],
            },
        ],
    },
    {
        story: '* chitchat.greet\n  - utter_hi',
        title: 'Greetings',
        storyGroupId: '456',
    },
];

const stripIds = (any) => {
    const input = any;
    if (Array.isArray(input)) return input.map(i => stripIds(i));
    if (typeof input === 'object') {
        if ('_id' in input) delete input._id;
        if ('checkpoints' in input) delete input.checkpoints;
        Object.keys(input).forEach((k) => {
            input[k] = stripIds(input[k]);
        });
    }
    return input;
};

const navigateToPath = (stories, path) => path.reduce((prev, curr) => {
    const nextLevel = prev.find(s => s._id === curr);
    expect(!!nextLevel).to.be.equal(true);
    return nextLevel.branches || nextLevel;
}, stories);

if (Meteor.isServer) {
    describe('loadStories', () => {
        it('should raise error on deviant input format', () => {
            const results = parseStoryGroup('123', badStories.join('\n')).map(e => e.error.message);
            expect(results[0]).to.include('sandwiched');
            expect(results[1]).to.include('convention not respected');
            expect(results[2]).to.include('multiple mothers');
            expect(results[3]).to.include('more than one destination');
            expect(results[4]).to.include('convention not respected');
        });
        it('required temporary features are extracted from raw story md', () => {
            expect(parseStoryGroup('123', storyGroupOne.join('\n'))).to.be.deep.equal(
                storyGroupOneParsed,
            );
        });
        it('required temporary features are extracted from raw story md across multiple story groups', () => {
            expect(parseStoryGroups(storyGroups)).to.be.deep.equal([
                ...storyGroupOneParsed,
                ...storyGroupTwoParsed,
            ]);
        });
        it('branching structure is reconstructed', () => {
            const storiesToInsert = generateStories(
                parseStoryGroups(storyGroups),
            ).stories;
            expect(stripIds(storiesToInsert)).to.be.deep.equal(storiesGenerated);
        });
        it('links are reconstructed from checkpoints', () => {
            const storiesToInsert = generateStories(
                parseStoryGroups(storyGroups),
            ).stories;
            const checkpointsOne = storiesToInsert.find(s => s.title === 'Farewells')
                .checkpoints;
            expect(checkpointsOne.length).to.be.equal(2);
            expect(
                stripIds(navigateToPath(storiesToInsert, checkpointsOne[0])),
            ).to.be.deep.equal({ story: '', title: 'New Branch 1' });
            expect(
                stripIds(navigateToPath(storiesToInsert, checkpointsOne[1])),
            ).to.be.deep.equal({ story: '', title: 'New Branch 2' });
            const checkpointsTwo = storiesToInsert.find(s => s.title === 'Greetings')
                .checkpoints;
            expect(checkpointsTwo.length).to.be.equal(1);
            expect(
                stripIds(navigateToPath(storiesToInsert, checkpointsTwo[0])),
            ).to.be.deep.equal({
                story: '',
                title: 'Farewells',
                storyGroupId: '123',
            });
        });
        it('Should drop broken checkpoints, and log warning', () => { // to do: log opposite: missing destinations
            const { warnings, stories } = generateStories(
                parseStoryGroups(storyGroups.slice(1, 2)), // only second group, with no origin for checkpoint_2
            );
            expect(stories[0].checkpoints).to.be.deep.equal([]);
            expect(warnings[0].message).to.include('no origin counterpart was found');
        });
        it('Should drop broken branches, and log warning', () => { // to do: log opposite: motherless children
            const { warnings, stories } = generateStories(
                parseStoryGroups([
                    {
                        name: 'childlessMother',
                        _id: '123',
                        rawText: storyGroupOne[1],
                    },
                ]),
            );
            expect(stories[0].branches).to.be.an('undefined');
            expect(warnings[0].message).to.include('branches were not found');
        });
    });
}
