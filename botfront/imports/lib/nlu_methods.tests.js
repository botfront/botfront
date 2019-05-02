import {Meteor} from 'meteor/meteor';
import chai, {expect, assert} from 'chai';
import faker from 'faker';
import yaml from 'js-yaml';
import {getTrainingDataInRasaFormat, getConfig} from "./nlu_methods";

const config1 = "language: \"en\"\npipeline:\n- name: \"featurizer1\"\n- name: \"featurizer2\"\n  flag: true";
const config2 = "language: \"en\"\npipeline:\n- name: \"featurizer1\"\n- name: \"featurizer2\"\n  flag: true\n- name: \"fuzzy_gazette\"";

const model1 = {
    chitchat_intents: ["greet"],
    config: config1,
    training_data: {
        common_examples: [{
            _id: "123",
            text: faker.lorem.sentence(),
            intent: faker.lorem.word('hacker.verb'),
            entities: [{e1: faker.lorem.word('hacker.verb')}],
        }],
        entity_synonyms: [{
            value: "new-york",
            synonyms: ["NYC", "Big Apple"]
        }]
    }
};

const model2 = {
    chitchat_intents: ["greet"],
    config: config2,
    training_data: {
        common_examples: [{
            _id: "123",
            text: faker.lorem.sentence(),
            intent: faker.lorem.word('hacker.verb'),
            entities: [{e1: faker.lorem.word('hacker.verb')}],
        }],
        fuzzy_gazette: [{
            value: "test_name",
            gazette: ['test1', 'test2'],
            mode: "ratio",
            min_score: 80,
        }]
    }
};

if (Meteor.isServer) {
    describe("training data has synonyms", function () {
        it("export should have the synonyms when present and enabled", function () {
            const output = getTrainingDataInRasaFormat(model1,true,[],false);
            expect(output.rasa_nlu_data.common_examples.length).to.be.equal(1);
            expect(output.rasa_nlu_data.common_examples[0]._id).to.be.an('undefined');
            expect(output.rasa_nlu_data.entity_synonyms.length).to.be.equal(1);
            expect(output.rasa_nlu_data.entity_synonyms[0]._id).to.be.an('undefined');
            // chai.expect(true).to.be(true)
        });

        it("export should not have the synonyms when present and disabled", function () {
            const output = getTrainingDataInRasaFormat(model1,false,[],false);
            expect(output.rasa_nlu_data.common_examples.length).to.be.equal(1);
            expect(output.rasa_nlu_data.entity_synonyms.length).to.be.equal(0);
            // chai.expect(true).to.be(true)
        })
    });

    describe("training data has fuzzy gazette", function () {
        it("export should have gazette when enabled", function () {
            const output = getTrainingDataInRasaFormat(model2, false, [], false, () => {}, true);
            expect(output.rasa_nlu_data.common_examples.length).to.be.equal(1);
            expect(output.rasa_nlu_data.entity_synonyms.length).to.be.equal(0);
            expect(output.rasa_nlu_data.fuzzy_gazette.length).to.be.equal(1);
            expect(output.rasa_nlu_data.fuzzy_gazette[0]._id).to.be.an('undefined');
        });

        it("export should not have gazette when disabled", function () {
            const output = getTrainingDataInRasaFormat(model2, false, [], false, () => {}, false);
            expect(output.rasa_nlu_data.common_examples.length).to.be.equal(1);
            expect(output.rasa_nlu_data.entity_synonyms.length).to.be.equal(0);
            expect(output.rasa_nlu_data.fuzzy_gazette.length).to.be.equal(0);
        })
    });

    describe("config yaml", function () {
        it("should be unchanged if no fuzzy_gazette present", function () {
            const config = getConfig(model1);
            expect(config).to.be.equal(yaml.dump(yaml.safeLoad(config1)));
        });

        it("should throw error if pipeline has fuzzy_gazette but not training_data", function () {
            model1.config = config2;
            expect(getConfig, model1).to.throw();
            model1.config = config1;
        });

        it("should change if fuzzy_gazette is in pipeline", function () {
            const config = getConfig(model2);
            expect(config).to.not.be.equal(yaml.dump(yaml.safeLoad(config2)));
            expect(yaml.load(config).pipeline[2]).to.have.property('entities');
            expect(yaml.load(config).pipeline[2].entities).to.deep.equal([{name: "test_name", mode: "ratio", min_score: 80}]);
        });

        it("should be unchanged if fuzzy_gazette in training_data but not in pipeline", function () {
            model2.config = config1;
            const config = getConfig(model2);
            expect(config).to.be.equal(yaml.dump(yaml.safeLoad(config1)));
            model2.config = config2;
        })
    })
}