import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { getTrainingDataInRasaFormat } from './instances.methods';
import nluModel from './testData/nlu_model_chitchat.data';
import { allExamples, selectedExamples, selectedExampleAndDummy } from './testData/results.data';

if (Meteor.isTest) {
    describe('getTrainingDataInRasaFormat', function () {
        if (Meteor.isServer) {
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
