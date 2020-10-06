
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
        const result = indexStory(storyFixtureA, { includeEventsField: true });
        expect(result).to.be.deep.equal({
            textIndex: {
                contents: 'hello \n helpOptions \n how_are_you \n mood positive \n utter_hello \n utter_tXd-Pm66 \n utter_Xywmv8uc \n utter_hwZIDQ5P \n utter_0H5XEC9h \n action_help \n mood',
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
            includeEventsField: true,
            update,
        });
        expect(result).to.be.deep.equal({
            textIndex: {
                contents: 'hello \n helpOptions \n how_are_you \n mood positive \n utter_new_response \n utter_tXd-Pm66 \n utter_Xywmv8uc \n utter_hwZIDQ5P \n utter_0H5XEC9h \n action_help \n mood',
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
