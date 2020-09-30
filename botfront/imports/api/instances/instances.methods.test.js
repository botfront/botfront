/* eslint-disable camelcase */
import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { getNluDataAndConfig } from './instances.methods';
import { Projects } from '../project/project.collection';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { insertExamples } from '../graphql/examples/mongo/examples';
import Examples from '../graphql/examples/examples.model';

const nluModel = {
    _id: 'test_model',
    projectId: 'test',
    name: 'chitchat-en',
    language: 'en',
    config: 'pipeline:\n  - name: WhitespaceTokenizer\n  - name: LexicalSyntacticFeaturizer\n  - name: CountVectorsFeaturizer\n  - name: CountVectorsFeaturizer\n    analyzer: char_wb\n    min_ngram: 1\n    max_ngram: 4\n  - name: DIETClassifier\n    epochs: 100\n  - name: rasa_addons.nlu.components.gazette.Gazette\n  - name: >-\n      rasa_addons.nlu.components.intent_ranking_canonical_example_injector.IntentRankingCanonicalExampleInjector\n  - name: EntitySynonymMapper',
    evaluations: [],
    intents: [],
    chitchat_intents: [],
    training_data: {
        common_examples: [
            {
                _id: 'd513ca5e-27d8-4911-814a-37247765bcf5',
                text: 'tt',
                intent: 'chitchat.tell_me_a_joke',
                entities: [],
                updatedAt: {
                    $date: '2020-07-17T20:08:45.208Z',
                },
            },
            {
                text: 'that\'s all goodbye',
                intent: 'chitchat.bye',
                entities: [],
                _id: 'd0f21d0e-f91e-46f1-a6e5-c2a51dead671',
                updatedAt: {
                    $date: '2020-07-17T14:30:53.998Z',
                },
            },
            {
                text: 'hello good evening',
                intent: 'chitchat.greet',
                entities: [],
                _id: '6bf308c2-15c3-4168-a05e-0ab3905360b4',
                updatedAt: {
                    $date: '2020-07-17T14:30:54.089Z',
                },
            },
        ],
        entity_synonyms: [
            {
                value: 'NYC',
                synonyms: [
                    'New-York',
                    'the big apple',
                ],
                _id: 'd390acad-18d6-4705-99b0-77b764525536',
            },
        ],
        regex_features: [],
        fuzzy_gazette: [],
    },
    updatedAt: {
        $date: '2020-07-17T20:08:45.207Z',
    },
};

const allExamples = [{
    text: 'tt', intent: 'chitchat.tell_me_a_joke', metadata: { canonical: true, language: 'en' }, entities: [],
}, {
    text: 'that\'s all goodbye', intent: 'chitchat.bye', metadata: { canonical: true, language: 'en' }, entities: [],
}, {
    text: 'hello good evening', intent: 'chitchat.greet', metadata: { canonical: true, language: 'en' }, entities: [],
}];

const testProject = {
    _id: 'test',
    namespace: 'bf-test',
    name: 'My Project',
    defaultLanguage: 'en',
    languages: ['en'],
    defaultDomain: {
        content:
            'slots:\n  disambiguation_message:\n    type: unfeaturized\nactions:\n  - action_botfront_disambiguation\n  - action_botfront_disambiguation_followup\n  - action_botfront_fallback\n  - action_botfront_mapping',
    },
    enableSharing: false,
    disabled: false,
    updatedAt: { $date: '2020-07-24T13:51:26.698Z' },
    storyGroups: ['r4xYPj8w6MgkwjQTm'],
    training: { instanceStatus: 'notTraining' },
};

const selectedExamples = allExamples.filter(({ intent }) => ['chitchat.greet', 'chitchat.bye'].includes(intent));
const selectedExampleAndDummy = [
    ...allExamples.filter(({ intent }) => ['chitchat.greet'].includes(intent)),
    {
        text: '0dummy0azerty0',
        intent: 'dumdum0',
        metadata: { canonical: true, language: 'en' },
        entities: [],
    },
];

if (Meteor.isTest) {
    describe('getNluDataAndConfig', function () {
        this.timeout(15000);
        if (Meteor.isServer) {
            before(async (done) => {
                await Projects.insert(testProject);
                await NLUModels.insert(nluModel);
                await insertExamples({
                    language: 'en',
                    projectId: 'test',
                    examples: nluModel.training_data.common_examples,
                });
                done();
            });
            after(async (done) => {
                await Projects.remove({ _id: 'test' });
                await NLUModels.remove({ projectId: 'test' });
                await Examples.deleteMany({ projectId: 'test' }).exec();
                done();
            });

            it('should generate a payload with all the nlu when there are no selected intents', async function () {
                const {
                    rasa_nlu_data: { common_examples },
                } = await getNluDataAndConfig('test', 'en');
                expect(common_examples).to.deep.equal(allExamples);
            });

            it('should generate a payload with only selected the nlu when there are selected intents', async function () {
                const {
                    rasa_nlu_data: { common_examples },
                } = await getNluDataAndConfig('test', 'en', [
                    'chitchat.greet',
                    'chitchat.bye',
                ]);
                expect(common_examples).to.deep.equal(selectedExamples);
            });

            it('should generate a payload with only one selected intent and a dummy one ', async function () {
                const {
                    rasa_nlu_data: { common_examples },
                } = await getNluDataAndConfig('test', 'en', ['chitchat.greet']);
                expect(common_examples).to.deep.equal(selectedExampleAndDummy);
            });
        }
    });
}
