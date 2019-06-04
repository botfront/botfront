/* eslint-disable no-undef */
let modelId = '';

describe('chat side panel handling', function() {
    before(function() {
        cy.login();
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.get('@bf_project_id').then((id) => {
            cy.createNLUModelProgramatically(id, 'MyModel', 'fr', 'my description')
                .then((result) => {
                    modelId = result;
                });
        });
    });

    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
    });

    after(function() {
        cy.deleteNLUModelProgramatically(null, this.bf_project_id, 'fr');
    });

    it('opens and close the chat', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${modelId}`);
        cy.get('[data-cy=open-chat]').click();
        cy.get('[data-cy=chat-pane]');
        cy.get('[data-cy=close-chat]').click();
        cy.get('[data-cy=chat-pane]').should('not.exist');
    });

    // TODO Need to find and fix the issue here, this test fails
    it('should display a message when no language are set', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${modelId}`);
        cy.get('[data-cy=duplicate-button]').click();
        cy.get('[data-cy=confirm-popup]').contains('Yes').click();
        cy.get('[data-cy=offline-model]').click();
        cy.get('[data-cy=confirm-popup]').contains('Yes').click();
        cy.get('[data-cy=open-model]')
            .eq(1)
            .click();
        cy.get('.nlu-menu-settings').click();
        cy.contains('Delete').click();
        cy.get('.nlu-menu-settings').click();
        cy.get('.dowload-model-backup-button').click();
        cy.get('.delete-model-button').click();
        cy.get('.ui.page.modals .primary').click();

        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.get('[data-cy=open-chat]').click();
        cy.get('[data-cy=no-language]');
        cy.get('[data-cy=chat-language-option]').should('not.exist');
        cy.get('[data-cy=close-chat]').click();

        cy.get('[data-cy=offline-model]').click();
        cy.get('[data-cy=confirm-popup]').contains('Yes').click();
    });

    it('should remove the core instance and the chat should display a message', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);

        cy.contains('Instances').click();
        cy.get('[data-cy=edit-instance]').eq(1).click();
        cy.get('i.delete.icon').click();
        cy.get('[data-cy=type-selector] input').type('nlu{enter}');
        cy.get('[data-cy=save-instance]').click();

        cy.visit(`/project/${this.bf_project_id}/nlu/model/${modelId}`);
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
