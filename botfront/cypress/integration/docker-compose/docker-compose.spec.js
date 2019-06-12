/* eslint-disable no-undef */

describe('Docker Compose', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });

    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
    });

    it('Docker compose should exist in more settings', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('More Settings').click();
        cy.contains('Docker Compose').should('exist');
    });
});
