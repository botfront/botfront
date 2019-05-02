/* eslint-disable no-undef */

describe('Project Credentials', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });

    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
    });

    describe('Endpoints', function() {
        it('Can be saved', function() {
            cy.visit(`/project/${this.bf_project_id}/settings`);
            cy.contains('Endpoints').click();
            cy.get('[data-cy=save-button]').click();
            cy.get('[data-cy=changes-saved]').should('be.visible');
        });
    });

    after(function() {
    });
});
