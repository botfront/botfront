import { safeLoad } from 'js-yaml';
import { isEqual } from 'lodash';

const STORY_FILE = 'stories_01.md';
const GOLD = 'domain.yml'

describe('extract domain from storyfile fixtures', function() {

    before(function() {
        cy.login();
        cy.fixture(GOLD).as('gold');
        cy.fixture(STORY_FILE).as('stories');
    });

    it('should output yaml matching the gold', function() {
        const gold = this.gold;
        const storyGroup = {
            name: 'test',
            projectId: 'test',
            stories: [this.stories]    
        };
        cy.MeteorCall('extractDomainFromStories', [storyGroup])
            .then(res => {
                expect(isEqual(safeLoad(res), safeLoad(gold))).to.be.equal(true);
            })
    })

    after(function() {
        cy.logout();
    });
});