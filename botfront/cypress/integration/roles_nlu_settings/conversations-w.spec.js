/* eslint-disable no-undef */

const email = 'conversationsw@test.ia';

describe('conversations:w role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('conversations:w', email, ['conversations:w'], id);
            cy.addTestConversation(id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
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
