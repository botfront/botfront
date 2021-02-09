/* global cy:true */

describe('Project Credentials', function() {
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

    describe('Credentials', function() {
        it('Can be saved', function() {
            cy.visit('/project/bf/settings');
            cy.contains('Credentials').click();
            cy.get('[data-cy=save-button]').click();
            cy.get('[data-cy=changes-saved]').should('be.visible');
        });

        it('should not have menu tabs with one env', function() {
            cy.visit('/project/bf/settings');
            cy.contains('Credentials').click();
            cy.dataCy('credentials-environment-menu').should('not.have.class', 'menu');
        });

        it('should have menu tabs with mutiple env', function() {
            cy.visit('/project/bf/settings');
            cy.dataCy('deployment-environments')
                .children().contains('production').click();
            cy.dataCy('save-changes').click();
            cy.visit('/project/bf/settings');
            cy.contains('Credentials').click();
            cy.dataCy('credentials-environment-menu').should('have.class', 'menu');
        });
    });
});
