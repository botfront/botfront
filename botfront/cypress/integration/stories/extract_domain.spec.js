/* eslint-disable no-undef */
import { safeLoad } from 'js-yaml';
import { isEqual } from 'lodash';
import gold2 from '../../fixtures/story_exceptions.json';
import { StoryController, extractDomain } from '../../../imports/lib/story_controller';

const slots = [
    {
        name: 'feedback_value',
        type: 'categorical',
        categories: ['positive', 'negative'],
    },
];

describe('extract domain from storyfile fixtures', function() {
    before(function() {
        cy.login();
        cy.fixture('domain.yml').as('gold');
        cy.fixture('stories_01.md').as('stories');
        cy.fixture('stories_02.md').as('stories2');
    });

    it('should output yaml matching the gold', function() {
        const gold = safeLoad(this.gold);
        const domain = safeLoad(extractDomain(this.stories.split('\n\n'), slots));
        expect(isEqual(domain, gold)).to.be.equal(true);
    });

    it('should output exceptions matching the gold', function() {
        const val = new StoryController(this.stories2, slots);
        const exceptions = val.exceptions.map(exception => ({
            line: exception.line,
            code: exception.code,
        }));
        expect(isEqual(exceptions, gold2)).to.be.equal(true);
    });

    after(function() {
        cy.logout();
    });
});
