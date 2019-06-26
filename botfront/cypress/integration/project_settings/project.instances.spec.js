/* eslint-disable no-undef */

describe('Project Instances', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });

    beforeEach(function() {
        cy.login();
    });

    describe('Instances', function() {
        it('should be able to edit already created instances', function() {
            cy.visit(`/project/${this.bf_project_id}/settings`);
            cy.contains('Instance').click();
            cy.get('[data-cy=save-instance]').click();
            cy.get('.s-alert-success').should('be.visible');
        });
    });
});
