import {Meteor} from 'meteor/meteor';
import {expect, assert, should} from 'chai'
import {
    _filterExamplesByTextWithSynonyms,
    _buildQuery,
    _getValueAndSynonymsForEntity,
    _getFilteringFunction,
    _cleanQuery,
    _appendSynonymsToText
} from "./filterExamples";

const model1 = {
    chitchat_intents: ["greet"],
    training_data: {
        common_examples: [{
            text: "nyc",
            entities: [{entity:"city", start: 0, end: 3, value: "nyc"}],
        }],
        entity_synonyms: [{
            value: "new-york",
            synonyms: ["nyc", "big apple"]
        }]
    }
};

if (Meteor.isServer) {

    describe("_cleanQuery", function () {
        it("should return filtered query ", function () {
            const q = _cleanQuery("word1   -s");
            expect(q).to.be.equal('word1');
        });

        it("should return filtered query ", function () {
            const q = _cleanQuery("word1   -s --an -sds");
            expect(q).to.be.equal('word1');
        });

        it("should return filtered query ", function () {
            const q = _cleanQuery("word1");
            expect(q).to.be.equal('word1');
        });
    });

    describe("_buildQuery", function () {
        it("simple query with 1 token", function () {
            const re = _buildQuery("word1   ");
            expect(re).to.be.equal('(word1)');
        });

        it("simple query with 3 tokens", function () {
            const re = _buildQuery("word1   word2     word3");
            expect(re).to.be.equal('(word1|word2|word3)');
        });
    });


    describe("_appendSynonymsToText", function () {

        const entitySynonyms = [{value: "new-york", synonyms: ["nyc", "big apple"] }, {value: "chinese", synonyms: ["chines", "chichin"] }];
        it("should return the right string", function () {
            const example = {text: "chines in nyc", entities:[{entity:'resto', start: 0, end: 6}, {entity:'city', start: 10, end: 13}]}
            const ex = _appendSynonymsToText(example, entitySynonyms);
            expect(ex.text).to.be.equal("chines in nyc");
            expect(ex.extra).to.be.equal("chines chichin chinese nyc big apple new-york");
        });

        it("should work when no entities in example", function () {
            const example = {text: "chines in nyc"};
            const ex = _appendSynonymsToText(example, entitySynonyms);
            expect(ex.text).to.be.equal("chines in nyc");
        });

        it("should work when empty entities in example", function () {
            const example = {text: "chines in nyc", entities:[]};
            const ex = _appendSynonymsToText(example, entitySynonyms);
            expect(ex.text).to.be.equal("chines in nyc");
        });

    });
}