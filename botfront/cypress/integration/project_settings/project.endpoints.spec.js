/* global cy:true */

describe('Project Endpoints', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    describe('Endpoints', function() {
        it('Can be saved', function() {
            cy.visit('/project/bf/settings');
            cy.contains('Endpoints').click();
            cy.get('[data-cy=save-button]').click();
            cy.get('[data-cy=changes-saved]').should('be.visible');
        });

        it('should not have menu tabs with one env', function() {
            cy.visit('/project/bf/settings');
            cy.contains('Endpoints').click();
            cy.dataCy('endpoints-environment-menu').should('not.have.class', 'menu');
        });

        it('should have menu tabs with mutiple env', function() {
            cy.visit('/project/bf/settings');
            cy.get('[data-cy=deployment-environments]')
                .children().contains('production').click();
            cy.get('[data-cy=save-changes]').click();
            cy.visit('/project/bf/settings');
            cy.contains('Endpoints').click();
            cy.dataCy('endpoints-environment-menu').should('have.class', 'menu');
        });
    });
});
