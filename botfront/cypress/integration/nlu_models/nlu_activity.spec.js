/* eslint-disable no-undef */
import { isEqual } from 'lodash';
import {
    project as project1, model as model1, training1, training2, training3, outdatedUt, lowIntent, lowEnt, lowEnts, high1, high2, high3,
} from '../../fixtures/smart_tips.json';
import { getSmartTips } from '../../../imports/lib/smart_tips';

describe('get the expected smart tips given TD and activity', function() {
    before(function() {
        cy.login();
        model1.training_data.common_examples.push(training1);
    });

    it('should detect outdated utterances', function() {
        const { code } = getSmartTips(model1, project1, outdatedUt, 0.50);
        expect(code).to.be.equal('outdated');
    });

    it('should detect intents below threshold', function() {
        const { code } = getSmartTips(model1, project1, lowIntent, 0.50);
        expect(code).to.be.equal('intentBelowTh');
    });

    it('should detect entities below threshold', function() {
        const { code } = getSmartTips(model1, project1, lowEnt, 0.50);
        expect(code).to.be.equal('entitiesBelowTh');
        const { code: code2 } = getSmartTips(model1, project1, lowEnts, 0.50);
        expect(code2).to.be.equal('entitiesBelowTh');
    });

    it('should detect entities and intents above threshold', function() {
        const { code } = getSmartTips(model1, project1, high1, 0.50);
        expect(code).to.be.equal('aboveTh');
    });

    it('should detect entities and intents above threshold with extra entity in TD', function() {
        model1.training_data.common_examples.push(training2);
        const { code, extraEntities } = getSmartTips(model1, project1, high1, 0.50);
        expect(code).to.be.equal('entitiesInTD');
        expect(isEqual(extraEntities, ['food'])).to.be.equal(true);
    });

    it('should detect entities and intents above threshold (bis)', function() {
        const { code, extraEntities } = getSmartTips(model1, project1, high2, 0.50);
        expect(code).to.be.equal('aboveTh');
        expect(isEqual(extraEntities, [])).to.be.equal(true);
    });

    it('should detect entities and intents above threshold with extra entity in TD (bis)', function() {
        model1.training_data.common_examples.push(training3);
        const { code, extraEntities } = getSmartTips(model1, project1, high2, 0.50);
        expect(code).to.be.equal('entitiesInTD');
        expect(isEqual(extraEntities, ['condiment'])).to.be.equal(true);
    });

    it('should detect entities and intents above threshold (bis2)', function() {
        const { code, extraEntities } = getSmartTips(model1, project1, high3, 0.50);
        expect(code).to.be.equal('aboveTh');
        expect(isEqual(extraEntities, [])).to.be.equal(true);
    });
});
