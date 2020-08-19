import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { getTrainingDataInRasaFormat } from './instances.methods';
import nluModel from './testData/nlu_model_chitchat.data';
import { allExamples, selectedExamples, selectedExampleAndDummy } from './testData/results.data';
import { Projects } from '../project/project.collection';
import { createTestUser } from '../testUtils';
// eslint-disable-next-line import/named
import { setUpRoles } from '../roles/roles';


const testProject = {
    _id: 'test',
    namespace: 'bf-test',
    name: 'My Project',
    defaultLanguage: 'en',
    defaultDomain: { content: 'slots:\n  disambiguation_message:\n    type: unfeaturized\nactions:\n  - action_botfront_disambiguation\n  - action_botfront_disambiguation_followup\n  - action_botfront_fallback\n  - action_botfront_mapping' },
    enableSharing: false,
    disabled: false,
    nlu_models: ['test_model'],
    updatedAt: { $date: '2020-07-24T13:51:26.698Z' },
    storyGroups: ['r4xYPj8w6MgkwjQTm'],
    training: { instanceStatus: 'notTraining' },
};

if (Meteor.isTest) {
    describe('getTrainingDataInRasaFormat', function () {
        if (Meteor.isServer) {
            beforeEach(async (done) => {
                setUpRoles();
                await createTestUser();
                await Projects.insert(testProject);
                done();
            });
            afterEach(async (done) => {
                await Projects.remove({ _id: 'test' });
                done();
            });

            it('should generate a payload with all the nlu when there are no selected intents', function () {
                const data = getTrainingDataInRasaFormat(nluModel);
                expect(data).to.deep.equal(allExamples);
            });

            it('should generate a payload with only selected the nlu when there are selected intents', function () {
                const data = getTrainingDataInRasaFormat(nluModel, true, ['chitchat.greet', 'chitchat.bye']);
                expect(data).to.deep.equal(selectedExamples);
            });

            it('should generate a payload with only one selected intent and a dummy one ', function () {
                const data = getTrainingDataInRasaFormat(nluModel, true, ['chitchat.greet']);
                expect(data).to.deep.equal(selectedExampleAndDummy);
            });
        }
    });
}
