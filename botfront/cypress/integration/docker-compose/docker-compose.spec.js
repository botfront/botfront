/* eslint-disable no-undef */

describe('Docker Compose', function() {
    before(function() {
        cy.createProject('bf', 'My Project', 'fr');
    });

    after(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
    });

    it('Docker compose should exist in more settings', function() {
        cy.visit('/project/bf/settings');
        cy.contains('More Settings').click();
        cy.contains('Docker Compose').should('exist');
    });
});
