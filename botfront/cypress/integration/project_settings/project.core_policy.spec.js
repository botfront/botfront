/* eslint-disable no-undef */

describe('Project Core Policy', function() {
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

    describe('Core Policy', function() {
        it('Can be saved', function() {
            cy.visit('/project/bf/settings');
            cy.contains('Core Policies').click();
            cy.get('[data-cy=save-button]').click();
            cy.get('[data-cy=changes-saved]').should('be.visible');
        });
    });
});
