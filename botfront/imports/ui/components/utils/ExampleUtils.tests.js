import chai from 'chai';
import ExampleUtils from './ExampleUtils';

const { assert, expect } = chai;

const copy = obj => JSON.parse(JSON.stringify(obj));

/* globals describe it */

const example = {
    text: 'This is an example',
    entities: [{
        entity: 'test',
        value: 'This',
        start: 0,
        end: 4,
    }],
    canonical: false,
    intent: 'intent',
    confidence: 0.4,
};

const stripped = copy(example);
delete stripped.confidence;

describe('Examples', () => {
    describe('validation of examples', function() {
        it('should validate good example', function() {
            assert.equal(ExampleUtils.validateBare(example), true);
        });
    
        it('should fail without id if withId is true', function() {
            assert.equal(ExampleUtils.validateBare(example, true), false);
            assert.equal(ExampleUtils.validateBare({ _id: '0123456789', ...example }, true), true);
        });
    });
    
    describe('stripping examples', function() {
        it('should remove extra parameters if they exist', function() {
            expect(ExampleUtils.stripBare(example)).to.be.deep.equal(stripped);
            expect(ExampleUtils.stripBare(stripped)).to.be.deep.equal(stripped);
        });
    
        it('should remove id unless withId set false', function() {
            expect(ExampleUtils.stripBare({ _id: '0123456789', ...example })).to.be.deep.equal({ _id: '0123456789', ...stripped });
            expect(ExampleUtils.stripBare({ _id: '0123456789', ...example }, false)).to.be.deep.equal(stripped);
        });
    });
    
    describe('updating intent', function() {
        it('should change the intent', function() {
            assert.equal(ExampleUtils.updateIntent(example, 'test').intent, 'test');
        });
    
        it('should set confidence to 1.0', function() {
            assert.equal(ExampleUtils.updateIntent(example, 'test').confidence, 1.0);
        });
    });
    
    describe('prepare example for database insertion', function() {
        it('should normalize example', function() {
            const ex = {
                text: 'test',
                intent: 'test',
                entities: [{
                    entity: 'time',
                    value: 1,
                    start: 0,
                    end: 4,
                    extra: [],
                }],
                extra: [],
                canonical: false,
            };
    
            const prepared = ExampleUtils.prepareExample(ex);
            expect(prepared).to.be.deep.equal({
                _id: prepared._id,
                text: 'test',
                intent: 'test',
                entities: [{
                    entity: 'time',
                    value: 'test',
                    start: 0,
                    end: 4,
                }],
                canonical: false,
            });
        });
    
        it('should filter duckling', function() {
            const ex = {
                text: 'test',
                intent: 'test',
                entities: [{
                    extractor: 'ner_duckling_http',
                }],
                canonical: false,
            };
    
            const prepared = ExampleUtils.prepareExample(ex);
                
            expect(prepared).to.be.deep.equal({
                _id: prepared._id,
                text: 'test',
                intent: 'test',
                entities: [],
                canonical: false,
            });
        });
    });
});
