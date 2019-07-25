/* eslint-disable no-undef */

const email = 'conversationsr@test.ia';

describe('conversations-viewer role permissions', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr');
        cy.createUser('conversations-viewer', email, ['conversations-viewer'], 'bf');
        cy.addTestConversation('bf');
        cy.loginTestUser(email);
    });

    afterEach(function() {
        cy.deleteProject('bf');
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
