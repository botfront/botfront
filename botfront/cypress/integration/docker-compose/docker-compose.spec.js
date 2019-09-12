/* eslint-disable no-undef */

describe('Docker Compose', function() {

    beforeEach(function() {
        cy.login();
        cy.createProject('bf', 'My Project', 'fr');
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('Docker compose should exist in more settings', function() {
        cy.visit('/project/bf/settings');
        cy.contains('More Settings').click();
        cy.contains('Docker Compose').should('exist');
    });
});
