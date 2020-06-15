import chai from 'chai';
import EntityUtils from './EntityUtils';

const { assert, expect } = chai;

/* globals describe it */

const copy = obj => JSON.parse(JSON.stringify(obj));

const entityBare = {
    entity: 'test',
    value: 'This',
    start: 0,
    end: 4,
};
const entityExtended = {
    entity: 'test',
    value: 'This',
    start: 0,
    end: 4,
    extractor: 'ner_crf',
    confidence: 0.5,
    processors: ['some_process'],
};

const example = {
    text: 'This is an example',
    entities: [entityBare],
    intent: 'intent',
    confidence: 0.4,
};


describe('Entities', () => {
    describe('validation of entities', function() {
        const bare = copy(entityBare);
        const extended = copy(entityExtended);
    
        it('should pass with bare', function() {
            assert.equal(EntityUtils.validateBare(bare), true);
        });
    
        it('should not pass without id if withId set true', function() {
            assert.equal(EntityUtils.validateBare(bare, true), false);
            assert.equal(EntityUtils.validateBare({ _id: '0123456789', ...bare }, true), true);
        });
    
        it('should pass for extended', function() {
            assert.equal(EntityUtils.validateBare(extended), true);
        });
    });
    
    describe('stripping entities', function() {
        const bare = copy(entityBare);
    
        it('should not change bare but should extended', function() {
            expect(EntityUtils.stripBare(bare)).to.be.deep.equal(entityBare);
            expect(EntityUtils.stripBare(entityExtended)).to.be.deep.equal(entityBare);
        });
    
        it('should not strip id unless otherwise specified', function() {
            expect(EntityUtils.stripBare({ _id: '0123456789', ...bare })).to.be.deep.equal({ _id: '0123456789', ...bare });
            expect(EntityUtils.stripBare({ _id: '0123456789', ...bare }, false)).to.be.deep.equal(entityBare);
        });
    });
    
    describe('updating example entity', function() {
        const exampl = copy(example);
        const bare = copy(entityBare);
        bare.entity = 'another';
    
        it('should change entity in example', function() {
            expect(EntityUtils.getUpdatedExample(exampl, example.entities[0], { entity: 'another' }).entities[0]).to.be.deep.equal(bare);
        });
    
        it('should set entity confidence to one', function() {
            const anotherCopy = copy(example);
            anotherCopy.entities[0].confidence = 0.5;
            expect(EntityUtils.getUpdatedExample(anotherCopy, example.entities[0], { entity: 'test' }).entities[0].confidence).to.be.deep.equal(1.0);
            delete anotherCopy.entities[0].confidence;
        });
    });
    
    describe('filter duckling', function() {
        it('should remove the objects with extractor starting with duckling', function() {
            const list = [{ extractor: 'test' }, { extractor: 'duckling_crf_merger' }, { extractor: 'ner_duckling_http' }, { extractor: 'ner_duckling' }];
            expect(list.filter(EntityUtils.filterDuckling)).to.be.deep.equal([list[0]]);
        });
    });
});
