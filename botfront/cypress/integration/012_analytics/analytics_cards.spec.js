/* eslint-disable no-undef */

describe('analytics cards', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
    });

    afterEach(function() {
        // cy.logout();
        // cy.deleteProject('bf');
    });

    it('should not show the export button when no data is loaded', function() {
        cy.visit('/project/bf/analytics');
        cy.dataCy('no-data-message').should('exist');
        cy.dataCy('analytics-export-button')
            .should('not.exist');
    });
});
