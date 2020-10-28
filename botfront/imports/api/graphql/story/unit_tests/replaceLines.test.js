import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { Stories } from '../../../story/stories.collection';
import { indexStory } from '../../../story/stories.index';
// test imports

import { replaceStoryLines } from '../mongo/stories';

const storyFixture = {
    _id: 'test_story',
    type: 'story',
    steps: [
        { intent: 'test' },
        { action: 'utter_red' },
        { action: 'utter_red' },
    ],
    title: 'Get started',
    storyGroupId: 'rQ9qHSxWi6WkoA9n2',
    projectId: 'bf',
    events: ['utter_red', 'utter_red_chair'],
    textIndex: 'test test test utter_red',
    branches: [
        {
            title: 'New Branch 1',
            branches: [
                {
                    title: 'New Branch 1',
                    branches: [],
                    _id: 'mauPhvHzG',
                    steps: [{ action: 'utter_red_chair' }],
                },
                {
                    title: 'New Branch 2',
                    branches: [],
                    _id: 'Qx5I3mF3pP',
                    steps: [{ action: 'utter_red' }],
                },
            ],
            _id: 'EqCAn1zH8o',
            steps: [
                { intent: 'test' },
                { action: 'utter_red' },
            ],
        },
        {
            title: 'New Branch 2',
            branches: [],
            _id: '2ZnQNwiA7A',
            steps: [
                { intent: 'test' },
                { action: 'utter_red_chair' },
            ],
        },
    ],
};

if (Meteor.isServer) {
    const insertDataAndIndex = async (done) => {
        await Stories.remove();
        await Stories.insert(storyFixture);
        const { textIndex } = await indexStory('test_story');
        await Stories.update({ _id: 'test_story' }, { $set: { textIndex, type: 'story' } });
        done();
    };
    // ------ test suite -------
    describe('replace story lines', () => {
        before((done) => {
            insertDataAndIndex(done);
        });
        it('replace a bot response line', async (done) => {
            await replaceStoryLines('bf', 'utter_red', 'utter_blue');
            await replaceStoryLines('bf', 'utter_blue', 'utter_purple');
            const storyResult = Stories.findOne({ _id: 'test_story' });
            expect(storyResult.steps).to.be.deep.equal([
                { intent: 'test' },
                { action: 'utter_purple' },
                { action: 'utter_purple' },
            ]);
            expect(storyResult.branches[0].steps).to.deep.equal([
                { intent: 'test' },
                { action: 'utter_purple' },
            ]);
            expect(storyResult.branches[0].branches[0].steps).to.deep.equal([{ action: 'utter_red_chair' }]);
            done();
        });
    });
}
