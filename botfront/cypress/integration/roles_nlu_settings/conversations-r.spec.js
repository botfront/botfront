/* eslint-disable no-undef */

const email = 'conversationsr@test.ia';

describe('conversations:r role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('conversations:r', email, ['conversations:r'], id);
            cy.addTestConversation(id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.deleteUser(email);
        cy.removeTestConversation();
    });

    it('should not show the delete conversation button', function() {
        cy.visit('/');
        cy.get('[data-cy=conversations-browser]');
        cy.get('.placeholder').should('not.exist');
        cy.get('[data-cy=conversation-delete]').should('not.exist');
    });

    it('should not be able to call forbidden methods', function() {
        cy.MeteorCall('conversations.delete', [
            '6f1800deea7f469b8dafd928f092a280',
        ]).then(err => expect(err.error).to.equal('403'));
    });
});
