import { expect } from 'chai';
import {
    training1,
    training2,
    training3,
    outdatedUt,
    lowIntent,
    lowEnt,
    lowEnts,
    high1,
    high2,
    high3,
} from './test_data/smart_tips.json';
import { getSmartTips } from './smart_tips';

const examples = [];
const endTime = '2000-05-01T16:12:55.601Z';
const nluThreshold = 0.5;

describe('get the expected smart tips given TD and activity', function () {
    before(function () {
        examples.push(training1);
    });

    it('should detect outdated utterances', function () {
        const { code } = getSmartTips({
            examples,
            endTime,
            nluThreshold,
            utterance: outdatedUt,
        });
        expect(code).to.be.equal('outdated');
    });

    it('should detect intents below threshold', function () {
        const { code } = getSmartTips({
            examples,
            endTime,
            nluThreshold,
            utterance: lowIntent,
        });
        expect(code).to.be.equal('intentBelowTh');
    });

    it('should detect entities below threshold', function () {
        const { code } = getSmartTips({
            examples,
            endTime,
            nluThreshold,
            utterance: lowEnt,
        });
        expect(code).to.be.equal('entitiesBelowTh');
        const { code: code2 } = getSmartTips({
            examples,
            endTime,
            nluThreshold,
            utterance: lowEnts,
        });
        expect(code2).to.be.equal('entitiesBelowTh');
    });

    it('should detect entities and intents above threshold', function () {
        const { code } = getSmartTips({
            examples,
            endTime,
            nluThreshold,
            utterance: high1,
        });
        expect(code).to.be.equal('aboveTh');
    });

    it('should detect entities and intents above threshold with extra entity in TD', function () {
        examples.push(training2);
        const { code, extraEntities } = getSmartTips({
            examples,
            endTime,
            nluThreshold,
            utterance: high1,
        });
        expect(code).to.be.equal('entitiesInTD');
        expect(extraEntities).to.be.deep.equal(['food']);
    });

    it('should detect entities and intents above threshold (bis)', function () {
        const { code, extraEntities } = getSmartTips({
            examples,
            endTime,
            nluThreshold,
            utterance: high2,
        });
        expect(code).to.be.equal('aboveTh');
        expect(extraEntities).to.be.deep.equal([]);
    });

    it('should detect entities and intents above threshold with extra entity in TD (bis)', function () {
        examples.push(training3);
        const { code, extraEntities } = getSmartTips({
            examples,
            endTime,
            nluThreshold,
            utterance: high2,
        });
        expect(code).to.be.equal('entitiesInTD');
        expect(extraEntities).to.be.deep.equal(['condiment']);
    });

    it('should detect entities and intents above threshold (bis2)', function () {
        const { code, extraEntities } = getSmartTips({
            examples,
            endTime,
            nluThreshold,
            utterance: high3,
        });
        expect(code).to.be.equal('aboveTh');
        expect(extraEntities).to.be.deep.equal([]);
    });
});
