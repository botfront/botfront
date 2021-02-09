/* global cy:true */

describe('Project Instances', function() {
    before(function() {
        cy.createProject('bf', 'My Project', 'fr');
    });

    after(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.login();
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
