/* eslint-disable no-undef */


describe('incoming page', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
        cy.importProject('bf', 'botfront_project_import.json');
    });
    afterEach(function () {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('should have be able to navigate conversations with the menu', function() {
        cy.visit('/project/bf/incoming');
        cy.dataCy('incoming-conversations-tab')
            .click();
        cy.dataCy('conversation-menu-item')
            .first()
            .should('have.class', 'active');
        cy.dataCy('conversation-menu-item')
            .eq(5)
            .click();
        cy.dataCy('conversation-menu-item')
            .first()
            .should('not.have.class', 'active');
        cy.reload();
        cy.dataCy('conversation-menu-item')
            .eq(5)
            .should('have.class', 'active');

        cy.dataCy('conversations-next-page')
            .click();
        cy.dataCy('conversations-next-page')
            .should('not.exist');
        cy.reload();
        cy.dataCy('conversations-next-page')
            .should('not.exist');

        cy.dataCy('conversations-previous-page')
            .click();
        cy.dataCy('conversations-previous-page')
            .should('not.exist');
        cy.reload();
        cy.dataCy('conversations-previous-page')
            .should('not.exist');
    });
});
