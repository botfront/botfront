/* eslint-disable no-undef */

const email = 'conversationsw@test.ia';

describe('conversations-editor role permissions', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr');
        cy.createUser('conversations-editor', email, ['conversations-editor'], 'bf');
        cy.addTestConversation('bf');
        cy.loginTestUser(email);
    });

    afterEach(function() {
        cy.removeTestConversation();
        cy.deleteProject('bf');
        cy.deleteUser(email);
    });

    it('should be able to display and delete a conversation', function() {
        cy.visit('/');
        // The user should automatically be redirected to the conversation screen
        cy.get('[data-cy=conversation-delete]');
        cy.get('.placeholder').should('not.exist');
        cy.get('[data-cy=conversation-delete]').click();
        cy.get('[data-cy=conversation-delete]').should('not.exist');
    });
});
