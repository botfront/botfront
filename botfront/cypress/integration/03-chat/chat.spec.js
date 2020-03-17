/* global cy:true */

describe('chat side panel handling', function() {
    before(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr')
            .then(() => cy.createNLUModelProgramatically('bf', '', 'en'))
            .then(() => cy.login());
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('opens and close the chat', function() {
        cy.visit('/project/bf/stories');
        cy.get('[data-cy=open-chat]').click();
        cy.get('[data-cy=chat-pane]');
        cy.get('.widget-embedded');
        cy.get('[data-cy=close-chat]').click();
        cy.get('[data-cy=chat-pane]').should('not.exist');
    });

    it('should not crash when changing language', function() {
        cy.visit('/project/bf/dialogue/templates');
        cy.get('[data-cy=open-chat]').click();
        cy.get('[data-cy=chat-language-option]').click();
        cy.get('[data-cy=chat-language-option] .visible.menu')
            .contains('en')
            .click();
    });
});
