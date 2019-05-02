/* eslint-disable no-undef */
import { expect } from 'chai';
import ActivityActions from './ActivityActions';


const entities1 = [{
    confidence: 0.96,
    extractor: 'ner_crf',
}, {
    confidence: 0.85,
    extractor: 'ner_crf',
}, {
    confidence: 0.46,
    extractor: 'ner_crf',
}, {
    confidence: 0.99,
    extractor: 'other_extractor',
}];

const entities2 = [{
    confidence: 0.96,
    extractor: 'ner_crf',
}, {
    confidence: 0.85,
    extractor: 'ner_crf',
}, {
    confidence: 0.8,
    extractor: 'ner_crf',
}];

const examples = [{ confidence: 0.8, entities: entities1 }, { confidence: 0.7, entities: entities1 }, { confidence: 0.9, entities: entities1 }];
const examples2 = [{ confidence: 0.8, entities: entities2 }, { confidence: 0.7, entities: entities2 }, { confidence: 0.9, entities: entities1 }];
const examples3 = [{ confidence: 0.5, entities: entities2 }, { confidence: 0.7, entities: entities2 }, { confidence: 0.4, entities: entities2 }];

describe('failing entities1', function () {
    it('should return the right number of items', function () {
        const failing = ActivityActions.getFailingEntities(entities1, 0.8);
        expect(failing.length).to.be.equal(1);
    });

    it('should return the right number of item', function () {
        const failing = ActivityActions.getFailingEntities(entities1, 0.2);
        expect(failing.length).to.be.equal(0);
    });

    it('should return the right number of items', function () {
        const failing = ActivityActions.getFailingEntities(entities1, 0.9);
        expect(failing.length).to.be.equal(2);
    });
});

describe('filtered examples', function () {
    it('not contain examples with entities or intent below the given threshold', function () {
        const filtered = ActivityActions.getExamplesFilterByConfidence(examples, 0.8);
        expect(filtered.length).to.be.equal(0);
    });


    it('not contain examples with entities or intent below the given threshold - 2', function () {
        const filtered = ActivityActions.getExamplesFilterByConfidence(examples3, 0.75);
        expect(filtered.length).to.be.equal(0);
    });

    it('only contain examples with all scores above threshold', function () {
        const filtered = ActivityActions.getExamplesFilterByConfidence(examples2, 0.8);
        expect(filtered.length).to.be.equal(1);
    });

    it('only contain examples with all scores above threshold', function () {
        const filtered = ActivityActions.getExamplesFilterByConfidence(examples2, 0.5);
        expect(filtered.length).to.be.equal(2);
    });


});
