/* global cy:true */

describe('Project Endpoints', function() {
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

    describe('Endpoints', function() {
        it('Can be saved', function() {
            cy.visit('/project/bf/settings');
            cy.contains('Endpoints').click();
            cy.get('[data-cy=save-button]').click();
            cy.get('[data-cy=changes-saved]').should('be.visible');
        });
    });
});
