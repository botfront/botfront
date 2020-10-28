
import { expect } from 'chai';
import { Meteor } from 'meteor/meteor';
import { Stories } from './stories.collection';

const storyIds = ['story_A', 'story_B'];
export const storyFixtureA = {
    _id: storyIds[0],
    type: 'story',
    title: 'Welcome Story',
    storyGroupId: 'pYAvAsYw256uy8bGF',
    projectId: 'bf',
    events: [
        'utter_hello',
        'utter_tXd-Pm66',
        'utter_Xywmv8uc',
        'utter_hwZIDQ5P',
        'utter_0H5XEC9h',
        'action_help',
    ],
    branches: [
        {
            title: 'New Branch 1',
            branches: [],
            _id: 'story_A_branch_A',
            steps: [
                { intent: 'helpOptions' },
                { action: 'action_help' },
                { action: 'utter_tXd-Pm66' },
            ],
        },
        {
            title: 'New Branch 2',
            branches: [],
            _id: 'story_A_branch_B',
            steps: [
                { intent: 'how_are_you' },
                { action: 'utter_Xywmv8uc' },
                { intent: 'mood', entities: [{ positive: 'good' }] },
                { action: 'utter_hwZIDQ5P' },
                { action: 'utter_0H5XEC9h' },
                { slot_was_set: [{ mood: 'set' }] },
            ],
        },
    ],
    steps: [
        { intent: 'hello' },
        { action: 'utter_hello' },
        { action: 'utter_tXd-Pm66' },
    ],
};
const storyFixtureB = { ...storyFixtureA, _id: storyIds[1] };

if (Meteor.isServer) {
    import './stories.methods';
    
    // ------ test suite -------
    describe('story textIndexes and events are kept for all types of updates', () => {
        beforeEach(done => (async () => {
            await Stories.remove({ _id: { $in: storyIds } });
            await Stories.insert(storyFixtureA);
            await Stories.insert(storyFixtureB);
            done();
        })());
        after(done => (async () => {
            await Stories.remove();
            done();
        })());
        it('update an array of stories with matching ids', done => (async () => {
            try {
                await Meteor.callWithPromise('stories.update', [
                    { _id: storyIds[0], projectId: 'bf' },
                    { _id: storyIds[1], projectId: 'bf' },
                ]);
                const result = await Stories.find({ _id: { $in: storyIds } }).fetch();
                expect(result).to.have.length(2);
                expect(result[0].events).to.have.length(storyFixtureA.events.length);
                expect(result[0].textIndex).to.deep.equal(
                    'hello utter_hello utter_tXd-Pm66 New Branch 1 story_A_branch_A helpOptions action_help utter_tXd-Pm66 New Branch 2 story_A_branch_B how_are_you utter_Xywmv8uc mood positive good utter_hwZIDQ5P utter_0H5XEC9h mood set',
                );
                expect(result[1].events).to.have.length(storyFixtureB.events.length);
                expect(result[1].textIndex).to.deep.equal(
                    'hello utter_hello utter_tXd-Pm66 New Branch 1 story_A_branch_A helpOptions action_help utter_tXd-Pm66 New Branch 2 story_A_branch_B how_are_you utter_Xywmv8uc mood positive good utter_hwZIDQ5P utter_0H5XEC9h mood set',
                );
                done();
            } catch (error) {
                done(error);
            }
        })());
        it('throw an error when projectIds', done => (async () => {
            await Meteor.call('stories.update', [
                { _id: storyIds[0], projectId: 'bf' },
                { _id: storyIds[1], projectId: 'non_matching_id' },
            ], (error) => {
                expect(error).to.not.equal(undefined);
                done();
            });
        })());
        it('update a single story without a branch path', done => (async () => {
            try {
                await Meteor.callWithPromise('stories.update', {
                    _id: storyIds[0], projectId: 'bf',
                });
                const result = await Stories.findOne({ _id: storyIds[0] });
                expect(result.events).to.have.length(storyFixtureA.events.length);
                expect(result.textIndex).to.deep.equal(
                    'hello utter_hello utter_tXd-Pm66 New Branch 1 story_A_branch_A helpOptions action_help utter_tXd-Pm66 New Branch 2 story_A_branch_B how_are_you utter_Xywmv8uc mood positive good utter_hwZIDQ5P utter_0H5XEC9h mood set',
                );
                done();
            } catch (error) {
                done(error);
            }
        })());
        it('update a single story without a branch path', done => (async () => {
            try {
                await Meteor.callWithPromise('stories.update', {
                    _id: storyIds[0], projectId: 'bf', path: ['story_A', 'story_A_branch_A'],
                });
                const result = await Stories.findOne({ _id: storyIds[0] });
                expect(result.events).to.have.length(storyFixtureA.events.length);
                expect(result.textIndex).to.deep.equal(
                    'hello utter_hello utter_tXd-Pm66 New Branch 1 story_A_branch_A helpOptions action_help utter_tXd-Pm66 New Branch 2 story_A_branch_B how_are_you utter_Xywmv8uc mood positive good utter_hwZIDQ5P utter_0H5XEC9h mood set',
                );
                done();
            } catch (error) {
                done(error);
            }
        })());
    });
}
