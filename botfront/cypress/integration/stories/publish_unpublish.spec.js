/* global cy */

describe('publish and unpublish stories', function() {
    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
    });

   
    it('should have all stories published by default when there only the dev environement', function() {
        cy.visit('/project/bf/stories');
        cy.get('.toggle').should('not.exist');
        cy.dataCy('story-group-menu-item', 'Greetings').find('span').should('not.have.class', 'grey');
        cy.dataCy('story-group-menu-item', 'Farewells').find('span').should('not.have.class', 'grey');
        cy.dataCy('story-group-menu-item', 'Get started').find('span').should('not.have.class', 'grey');
    });


    it('should be able to publish and unpublish stories when prod or statging are enabled', function() {
        cy.visit('/project/bf/settings');
        cy.get('[data-cy=deployment-environments]')
            .children().contains('production').click();
        cy.get('[data-cy=save-changes]').click();
        cy.visit('/project/bf/stories');
        cy.get('div:not(.hidden) > .toggle.on').should('have.length', 3);
        cy.dataCy('story-group-menu-item', 'Greetings').find('div:not(.hidden) > .toggle').click({ force: true });
        cy.dataCy('story-group-menu-item', 'Greetings').find('div:not(.hidden) > .toggle').should('have.class', 'off');
        cy.get('div:not(.hidden) > .toggle.on').should('have.length', 2);
        cy.dataCy('story-group-menu-item', 'Greetings').find('span').should('have.class', 'grey');
        // we chech that clicking on unpublish reveal one more item
        // because it's difficult to check for parent link with cypress
        cy.dataCy('story-group-menu-item').should('have.length', 6);
        cy.get('.item > .side-by-side > .item-chevron').first().click();
        cy.dataCy('story-group-menu-item').should('have.length', 7);
    });

    it('when removing production environement, all stories should be published', function() {
        cy.visit('/project/bf/settings');
        cy.get('[data-cy=deployment-environments]')
            .children().contains('production').click();
        cy.get('[data-cy=save-changes]').click();
        cy.visit('/project/bf/stories');
        cy.get('div:not(.hidden) > .toggle.on').should('have.length', 3);
        cy.dataCy('story-group-menu-item', 'Greetings').find('div:not(.hidden) > .toggle').click({ force: true });
        cy.dataCy('story-group-menu-item', 'Greetings').find('div:not(.hidden) > .toggle').should('have.class', 'off');
        cy.get('div:not(.hidden) > .toggle.on').should('have.length', 2);
        cy.dataCy('story-group-menu-item', 'Greetings').find('span').should('have.class', 'grey');
        cy.visit('/project/bf/settings');
        cy.get('[data-cy=deployment-environments]')
            .children().contains('production').click();
        cy.get('[data-cy=save-changes]').click();
        cy.visit('/project/bf/stories');
        cy.dataCy('story-group-menu-item', 'Greetings').find('span').should('not.have.class', 'grey');
    });
});
