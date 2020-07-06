import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { Stories } from '../../../story/stories.collection';
// test imports

import { replaceStoryLines } from '../mongo/stories';

const storyFixture = {
    _id: 'test_story',
    story: '* test\n - utter_red\n utter_red',
    title: 'Get started',
    storyGroupId: 'rQ9qHSxWi6WkoA9n2',
    projectId: 'bf',
    events: ['utter_red', 'utter_red_chair'],
    textIndex: {
        contents:
            'test \n test \n test \n utter_red',
        info: 'Get started',
    },
    branches: [
        {
            title: 'New Branch 1',
            branches: [
                {
                    title: 'New Branch 1',
                    branches: [],
                    _id: 'mauPhvHzG',
                    story: '- utter_red_chair',
                },
                {
                    title: 'New Branch 2',
                    branches: [],
                    _id: 'Qx5I3mF3pP',
                    story: '- utter_red ',
                },
            ],
            _id: 'EqCAn1zH8o',
            story: '* test\n  - utter_red',
        },
        {
            title: 'New Branch 2',
            branches: [],
            _id: '2ZnQNwiA7A',
            story: '* test\n  - utter_red_chair',
        },
    ],
};

if (Meteor.isServer) {
    const insertDataAndIndex = async (done) => {
        await Stories.remove();
        await Stories.insert(storyFixture);
        done();
    };
    // ------ test suite -------
    describe.only('replace story lines', () => {
        before((done) => {
            insertDataAndIndex(done);
        });
        it('replace a bot response line', (done) => {
            replaceStoryLines('bf', 'utter_red', 'utter_blue');
            done();
        });
    });
}
