/* global cy:true */

describe('Project Instances', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr');
        cy.login();
    });

    afterEach(function() {
        cy.deleteProject('bf');
        cy.logout();
    });

    describe('Instances', function() {
        it('should be able to edit already created instances', function() {
            cy.visit('/project/bf/settings');
            cy.contains('Instance').click();
            cy.get('[data-cy=save-instance]').click();
            cy.get('.s-alert-success').should('be.visible');
        });
    });
});
