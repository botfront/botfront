/* global cy:true */

describe('Project Core Policy', function() {
    before(function() {
        cy.deleteProject('bf');
    });

    afterEach(function() {
        cy.deleteProject('bf');
        cy.logout();
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login());
    });

    describe('Core Policy', function() {
        it('Can be saved', function() {
            cy.visit('/project/bf/dialogue');
            cy.dataCy('policies-modal').click();
            cy.get('[data-cy=save-button]').click();
            cy.get('[data-cy=changes-saved]').should('be.visible');
        });
    });
});
