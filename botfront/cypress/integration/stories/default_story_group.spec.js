/* eslint-disable no-undef */

describe('default story creation ', () => {
    before(() => {
        cy.createProject('bf', 'My Project', 'en');
    });
    beforeEach(() => {
        cy.login();
    });
    after(() => {
        cy.deleteProject('bf');
    });

    it('should create the default story group with stories Grettings and Farwells', () => {
        // clicks on the default story group
        cy.visit('project/bf/stories');
        cy.contains('Default stories').click();

        // checks that the Greetings story exists with default contents
        cy.get('[value~=\'Greetings\']').should('exist');
        cy.contains('chitchat.greet').should('exist');
        cy.contains('- utter_hi').should('exist');
        // deletes the Greetings story
        cy.get('[value~=\'Greetings\']')
            .closest('[data-cy=story-editor]')
            .find('[data-cy=delete-story]')
            .click();
        cy.get('[data-cy=confirm-popup]')
            .get('[data-cy=confirm-yes]')
            .click();

        // checks that the Farewells story exists
        cy.get('[value~=\'Farewells\']').should('exist');
        cy.contains('chitchat.bye').should('exist');
        cy.contains('- utter_bye').should('exist');

        // deletes the farewells story
        cy.get('[value~=\'Farewells\']').should('exist')
            .closest('[data-cy=story-editor]')
            .find('[data-cy=delete-story]')
            .click();
        cy.get('[data-cy=confirm-popup]')
            .get('[data-cy=confirm-yes]')
            .click();

        // there should be no additional stories in default stories
        cy.get('[data-cy=browser-item]')
            .should('not.exist');
    });
});
