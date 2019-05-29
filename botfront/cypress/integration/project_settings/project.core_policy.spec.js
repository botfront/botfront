/* eslint-disable no-undef */

describe('Project Core Policy', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });

    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
    });

    describe('Core Policy', function() {
        it('Can be saved', function() {
            cy.visit(`/project/${this.bf_project_id}/settings`);
            cy.contains('Core Policy').click();
            cy.get('[data-cy=save-button]').click();
            cy.get('.s-alert-success').should('be.visible');
        });
    });
});
