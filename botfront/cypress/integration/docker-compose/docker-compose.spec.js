/* global cy:true */

describe('Docker Compose', function() {

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr');
        cy.login();
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
