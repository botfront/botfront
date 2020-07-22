/* global cy:true */

describe('Project Core Policy', function() {
    before(function() {
        cy.deleteProject('bf');
    });

    afterEach(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login());
    });

    afterEach(function() {
        cy.logout();
    });

    describe('Core Policy', function() {
        it('Can be saved', function() {
            cy.visit('/project/bf/dialogs');
            cy.dataCy('policies-modal').click();
            cy.get('[data-cy=save-button]').click();
            cy.get('[data-cy=changes-saved]').should('be.visible');
        });
    });
});
