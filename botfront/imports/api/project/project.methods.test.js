import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
// eslint-disable-next-line import/named
import { extractDomainFromStories, extractData } from './project.methods';

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

const models = [
    {
        _id: 'jBEFEmL4X33Y6op49',
        training_data: {
            common_examples: [
                {
                    text: 'human now',
                    intent: 'basics.request_handover',
                    entities: [{
                        start: 0, end: 5, value: 'human', entity: 'human',
                    }],
                    _id: '0e6e7175-6718-42ee-a033-55fb96aeacdb',
                },
                {
                    text: 'cancel',
                    intent: 'basics.time',
                    entities: [{
                        start: 0, end: 6, value: 'cancel', entity: 'time',
                    }],
                    _id: '0e6e7175-6718-42ee-a033-55fb96aeacdb',
                },
            ],
            entity_synonyms: [],
            regex_features: [],
            fuzzy_gazette: [],
        },
    },

    {
        _id: 'jBEFEmL4X33Y6op49',
        training_data: {
            common_examples: [
                {
                    text: 'this is an actual test',
                    intent: 'basics.test',
                    entities: [{
                        start: 18, end: 23, value: 'test', entity: 'test',
                    }],
                    _id: '0e6e7175-6718-42ee-a033-55fb96aeacdb',
                },
            ],
            entity_synonyms: [],
            regex_features: [],
            fuzzy_gazette: [],
        },
    },
];

const emptyTrainingData = [
    {
        _id: 'jBEFEmL4X33Y6op49',
        training_data: {
            common_examples: [],
            entity_synonyms: [],
            regex_features: [],
            fuzzy_gazette: [],
        },
    },
    {
        _id: 'jBEFEmL4X33Y6op49',
        training_data: {
            common_examples: [],
            entity_synonyms: [],
            regex_features: [],
            fuzzy_gazette: [],
        },
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

            it('extraction from training data, case with multiple models, and multiple entities and intents', function() {
                const { intents, entities } = extractData(models);
                expect(intents).to.deep.equal(
                    new Set(['basics.time', 'basics.request_handover', 'basics.test']),
                );
                expect(entities).to.deep.equal(new Set(['human', 'time', 'test']));
            });

            it('should not crash when training data is empty', function() {
                const { intents, entities } = extractData(emptyTrainingData);
                expect(intents).to.deep.equal(new Set([]));
                expect(entities).to.deep.equal(new Set([]));
            });
        }
    });
}
