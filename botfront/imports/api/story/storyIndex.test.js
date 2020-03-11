
import { expect } from 'chai';
import { indexStory } from './stories.index';

const storyFixture = {
    _id: 'vRTJCXF5dmohJ53Kz',
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
            _id: 'wBzDjbDu',
            story: '* helpOptions\n  - action_help\n  - utter_tXd-Pm66',
        },
        {
            title: 'New Branch 2',
            branches: [],
            _id: 'vQMx0FvVC',
            story:
                '* how_are_you\n  - utter_Xywmv8uc\n* mood{"positive": "good"}\n  - utter_hwZIDQ5P\n  - utter_0H5XEC9h\n  - slot{"mood":"set"}',
        },
    ],
    story: '* hello\n - utter_hello',
};

const updateFixture = {
    _id: 'vRTJCXF5dmohJ53Kz',
    path: ['vRTJCXF5dmohJ53Kz'],
    story: '* hello\n  - utter_new_response',
};

// ------ test suite -------
describe('old tests', () => {
    it('should index the story and get a list of events', () => {
        const result = indexStory(storyFixture, { includeEventsField: true });
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
        const result = indexStory(storyFixture, {
            includeEventsField: true,
            update: {
                _id: 'vRTJCXF5dmohJ53Kz', story: updateFixture.story,
            },
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
