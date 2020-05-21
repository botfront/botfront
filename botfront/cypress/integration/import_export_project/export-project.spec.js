/* global cy Cypress:true */

const changeAPIUrl = (url) => {
    cy.visit('/project/test_project/settings');
    cy.dataCy('project-settings-more')
        .click();
    cy.dataCy('admin-settings-menu')
        .find('a')
        .contains('Misc')
        .click();
    cy.dataCy('docker-api-host')
        .click();
    cy.dataCy('docker-api-host')
        .find('input')
        .clear()
        .type(`${url}{enter}`);
    cy.get('.primary.button').first().click();
};

describe('Exporting a Project', function() {
    beforeEach(function() {
        cy.createProject('test_project', 'My Project', 'fr');
        cy.login();
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('test_project');
    });

    describe('Export UI', function() {
        it('should be able to export a project', function() {
            cy.visit('/project/test_project/settings');
            cy.contains('Import/Export').click();
            cy.dataCy('port-project-menu')
                .find('.item')
                .contains('Export')
                .click();
            cy.dataCy('export-type-dropdown')
                .click()
                .find('span')
                .contains('Botfront')
                .click();
            cy.dataCy('export-button')
                .click();
            cy.dataCy('export-success-message')
                .contains('Your project has been successfully exported for Botfront!')
                .should('exist');
        });
        it('should display an error message when the api request fails', function() {
            changeAPIUrl('haha');
            cy.visit('/project/test_project/settings');
            cy.contains('Import/Export').click();
            cy.dataCy('port-project-menu')
                .find('.item')
                .contains('Export')
                .click();
            cy.dataCy('export-type-dropdown')
                .click()
                .find('span')
                .contains('Botfront')
                .click();
            cy.dataCy('export-button')
                .click();
            cy.dataCy('export-failure-message')
                .should('exist');
            changeAPIUrl(Cypress.env('API_URL'));
        });
    });
});
