
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
            textIndex: {
                contents: 'hello helpOptions how_are_you mood positive utter_hello utter_tXd-Pm66 utter_Xywmv8uc utter_hwZIDQ5P utter_0H5XEC9h action_help mood',
                info: 'Welcome Story',
            },
            events: [
                'utter_hello',
                'utter_tXd-Pm66',
                'utter_Xywmv8uc',
                'utter_hwZIDQ5P',
                'utter_0H5XEC9h',
                'action_help',
            ],
        });
    });
    it('should index the story and get a list of events', () => {
        const result = indexStory(storyFixtureA, {
            update,
        });
        expect(result).to.be.deep.equal({
            textIndex: {
                contents: 'hello helpOptions how_are_you mood positive utter_new_response utter_tXd-Pm66 utter_Xywmv8uc utter_hwZIDQ5P utter_0H5XEC9h action_help mood',
                info: 'Welcome Story',
            },
            events: [
                'utter_new_response',
                'utter_tXd-Pm66',
                'utter_Xywmv8uc',
                'utter_hwZIDQ5P',
                'utter_0H5XEC9h',
                'action_help',
            ],
        });
    });
});
