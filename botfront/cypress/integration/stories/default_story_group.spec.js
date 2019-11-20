/* global cy:true */

describe('default story creation ', () => {
    beforeEach(() => {
        cy.createProject('bf', 'My Project', 'en');
        cy.login();
    });

    afterEach(() => {
        cy.deleteProject('bf');
        cy.logout();
    });

    it('should create the default story group with stories Grettings and Farwells', () => {
        // clicks on the default story group
        cy.visit('project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });

        cy.contains('Default stories').click();

        // checks that the Greetings story exists with default contents
        cy.contains('Greetings').should('exist');
        cy.contains('chitchat.greet').should('exist');
        cy.contains('- utter_hi').should('exist');

        // checks that the Farewells story exists
        cy.contains('Farewells').should('exist');
        cy.contains('chitchat.bye').should('exist');
        cy.contains('- utter_bye').should('exist');

        // deletes the greetings story
        cy.contains('Greetings').should('exist')
            .closest('[data-cy=story-editor]')
            .find('[data-cy=delete-story]')
            .click({ force: true });
        cy.get('[data-cy=confirm-popup]')
            .get('[data-cy=confirm-yes]')
            .click({ force: true });
        // deletes the farewells story
        cy.dataCy('story-editor').should('have.length', 1);
        cy.contains('Farewells').should('exist');
        cy.get('[data-cy=story-editor]')
            .find('[data-cy=delete-story]')
            .click({ force: true });
        cy.get('[data-cy=confirm-popup]')
            .get('[data-cy=confirm-yes]')
            .click({ force: true });
        cy.wait(100); // wait for the story group to be removed because it is empty

        // there should be no additional stories in default stories
        cy.dataCy('browser-item')
            .contains('Default stories')
            .should('not.exist');
    });
});
