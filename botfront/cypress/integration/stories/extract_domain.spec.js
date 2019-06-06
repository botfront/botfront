/* eslint-disable no-undef */
import { safeLoad } from 'js-yaml';
import { isEqual } from 'lodash';
import gold2 from '../../fixtures/story_exceptions.json';

describe('extract domain from storyfile fixtures', function() {
    before(function() {
        cy.login();
        cy.fixture('domain.yml').as('gold');
        // cy.fixture('story_exceptions.json').as('gold2');
        cy.fixture('stories_01.md').as('stories');
        cy.fixture('stories_02.md').as('stories2');
    });

    it('should output yaml matching the gold', function() {
        const { gold } = this;
        const storyGroup = [this.stories];
        cy.MeteorCall('extractDomainFromStories', [storyGroup])
            .then((res) => {
                expect(isEqual(safeLoad(res), safeLoad(gold))).to.be.equal(true);
            });
    });

    it('should output exceptions matching the gold', function() {
        // const gold2 = JSON.parse(this.gold2);
        cy.MeteorCall('viewStoryExceptions', [this.stories2])
            .then((res) => {
                expect(isEqual(res, gold2)).to.be.equal(true);
            });
    });

    after(function() {
        cy.logout();
    });
});
