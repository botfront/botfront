import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import {
    parseStoryGroup, parseStoryGroups, generateStories,
} from './loadStories';
import {
    badStories, storyGroupOne, storyGroupOneParsed, storyGroupTwoParsed, storyGroups, storiesGenerated,
} from './loadStories.tests.data';

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
    return nextLevel.branches.length ? nextLevel.branches : nextLevel;
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
            ).to.be.deep.equal({ story: '', title: 'New Branch 1', branches: [] });
            expect(
                stripIds(navigateToPath(storiesToInsert, checkpointsOne[1])),
            ).to.be.deep.equal({ story: '', title: 'New Branch 2', branches: [] });
            const checkpointsTwo = storiesToInsert.find(s => s.title === 'Greetings')
                .checkpoints;
            expect(checkpointsTwo.length).to.be.equal(1);
            expect(
                stripIds(navigateToPath(storiesToInsert, checkpointsTwo[0])),
            ).to.be.deep.equal({
                story: '',
                title: 'Farewells',
                storyGroupId: '123',
                branches: [],
                type: 'story',
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
            // eslint-disable-next-line no-unused-expressions
            expect(stories[0].branches).to.be.an('array').that.is.empty;
            expect(warnings[0].message).to.include('branches were not found');
        });
    });
}
