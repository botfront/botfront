
import { expect } from 'chai';
import { indexStory } from './stories.index';
import { storyFixtureA } from './storyMethods.test';

const update = {
    _id: 'story_A',
    path: ['story_A'],
    steps: [
        { intent: 'hello' },
        { action: 'utter_new_response' },
    ],
};

// ------ test suite -------
describe('story indexing and events tests', () => {
    it('should index the story and get a list of events', () => {
        const result = indexStory(storyFixtureA);
        expect(result).to.be.deep.equal({
            textIndex: 'hello utter_hello utter_tXd-Pm66 New Branch 1 story_A_branch_A helpOptions action_help utter_tXd-Pm66 New Branch 2 story_A_branch_B how_are_you utter_Xywmv8uc mood positive good utter_hwZIDQ5P utter_0H5XEC9h mood set',
            events: [
                'utter_hello',
                'utter_tXd-Pm66',
                'action_help',
                'utter_Xywmv8uc',
                'utter_hwZIDQ5P',
                'utter_0H5XEC9h',
            ],
        });
    });
    it('should index the story and get a list of events with an update thrown in', () => {
        const result = indexStory(storyFixtureA, {
            update,
        });
        expect(result).to.be.deep.equal({
            textIndex: 'hello utter_new_response New Branch 1 story_A_branch_A helpOptions action_help utter_tXd-Pm66 New Branch 2 story_A_branch_B how_are_you utter_Xywmv8uc mood positive good utter_hwZIDQ5P utter_0H5XEC9h mood set',
            events: [
                'utter_new_response',
                'action_help',
                'utter_tXd-Pm66',
                'utter_Xywmv8uc',
                'utter_hwZIDQ5P',
                'utter_0H5XEC9h',
            ],
        });
    });
});
