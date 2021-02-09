/* eslint-disable no-undef */

describe('global settings', () => {
    beforeEach(function () {
        cy.createProject('bf', 'Duedix', 'fr');
    });

    beforeEach(function () {
        cy.deleteProject('bf');
    });

    it('should be able to access global settings through the admin sidebar', () => {
        cy.visit('/admin/settings');
        cy.contains('Default NLU Pipeline').should('exist');
        cy.contains('Default credentials').should('exist');
        cy.contains('Default endpoints').should('exist');
        cy.contains('Default default domain').should('exist');
        cy.contains('Webhooks').should('exist');
        cy.contains('Security').should('exist');
        cy.contains('Appearance').should('exist');
        cy.contains('Misc').should('exist');
    });
});
