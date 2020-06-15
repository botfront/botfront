/* global cy */

describe('analytics cards', function () {
    beforeEach(function () {
        // Make sure we have two projects, so we can switch from one to the other
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.createProject('bf2', 'My second project', 'fr').then(() => {
                cy.login();
            });
        });
    });

    afterEach(function () {
        cy.logout();
        cy.deleteProject('bf2');
        cy.deleteProject('bf');
    });

    it('should allow switching between projects', function () {
        cy.visit('/project/bf/analytics');
        cy.dataCy('no-data-message').should('exist');
        cy.get('[data-cy=project-menu] > :nth-child(1) > :nth-child(2) > .ui > :nth-child(3) > :nth-child(2)').scrollIntoView().click({ force: true });
        cy.dataCy('no-data-message').should('exist');
    });
});
