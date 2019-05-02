/* eslint-disable no-undef */

describe('chat side panel handling', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });

    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
    });

    it('opens and close the chat', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.get('[data-cy=open-chat]').click();
        cy.get('[data-cy=chat-pane]');
        cy.get('[data-cy=close-chat]').click();
        cy.get('[data-cy=chat-pane]').should('not.exist');
    });

    it('should remove the core instance and the chat should display a message', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);

        cy.contains('Instances').click();
        cy.get('[data-cy=edit-instance]').eq(1).click();
        cy.get('i.delete.icon').click();
        cy.get('[data-cy=type-selector] input').type('nlu{enter}');
        cy.get('[data-cy=save-instance]').click();

        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.get('[data-cy=open-chat]').click();
        cy.get('[data-cy=no-core-instance-message]');
        cy.get('[data-cy=settings-link]').click();
        cy.get('[data-cy=chat-pane]').should('not.exist');

        cy.contains('Instances').click();
        cy.get('[data-cy=edit-instance]').eq(1).click();
        cy.get('i.delete.icon').click();
        cy.get('[data-cy=type-selector] input').type('core{enter}');
        cy.get('[data-cy=save-instance]').click();

        cy.get('[data-cy=open-chat]').click();
        cy.get('[data-cy=no-core-instance-message]').should('not.exist');
    });

    it('should not crash when changing language', function() {
        cy.visit(`/project/${this.bf_project_id}/dialogue/templates`);

        cy.get('[data-cy=open-chat]').click();
        cy.get('[data-cy=chat-language-option]').click();
        cy.get('[data-cy=chat-language-option] .visible.menu').contains('en').click();
    });
});
