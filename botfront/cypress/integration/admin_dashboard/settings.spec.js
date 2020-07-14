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
        cy.contains('License Information').should('exist');
    });

    it('should able to see license information', () => {
        cy.visit('/admin/settings');
        cy.contains('License Information').click();
        cy.dataCy('license-expire').invoke('text').should('contain', 'Expire: Sun Nov 17 2047'); //
        cy.dataCy('license-user').should('have.text', ' Users quota: 3');
        cy.dataCy('license-project').should('have.text', ' Projects quota: 3');
        cy.dataCy('license-holder').should('have.text', ' License holder: test');
    });
});
