import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
// eslint-disable-next-line import/named
import { extractDomainFromStories } from './project.methods';

const stories = [
    {
        _id: 'oozR82KYZdwF9PL6G',
        story: '* get_started\n    - utter_get_started',
        title: 'Get started',
        storyGroupId: 'McySETYSgRHr5qRif',
        projectId: 'bf',
    },
    {
        _id: 'aqoo6S9wfjo5Z85gW',
        story: '* test_intent{"entity1": "value1"}\n    - utter_test_intent',
        title: 'Intro stories 2',
        projectId: 'bf',
        storyGroupId: 'McySETYSgRHr5qRif',
    },
];

if (Meteor.isTest) {
    describe('entities and intents extraction test', function() {
        if (Meteor.isServer) {
            it('extract intent and entities from stories', function() {
                const { intents, entities } = extractDomainFromStories(
                    stories.map(story => story.story),
                );
                expect(intents).to.deep.equal(['get_started', 'test_intent']);
                expect(entities).to.deep.equal(['entity1']);
            });
        }
    });
}
