/* eslint-disable no-undef */

describe('Exporting a Project', function() {
    beforeEach(function() {
        cy.createProject('test_project', 'My Project', 'fr');
        cy.login();
        cy.visit('/project/test_project/settings');
        cy.dataCy('project-settings-more')
            .click();
        cy.dataCy('admin-settings-menu')
            .find('a')
            .contains('Docker Compose')
            .click();
        cy.dataCy('docker-api-host')
            .click();
        cy.dataCy('docker-api-host')
            .find('input')
            .clear()
            .type(`${Cypress.env('API_URL')}{enter}`);
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('test_project');
    });

    describe('Export UI', function() {
        it('should be able to export a project with conversations', function() {
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
            cy.dataCy('export-link')
                .should('have.attr', 'href')
                .and('equal', `${Cypress.env('API_URL')}/project/test_project/export?output=json&conversations=true`);
        });
        it('should be able to export a project without conversations', function() {
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
            cy.dataCy('conversation-toggle')
                .click();
            cy.wait(1000);
            cy.dataCy('export-button')
                .click();
            cy.dataCy('export-success-message')
                .contains('Your project has been successfully exported for Botfront!')
                .should('exist');
            cy.dataCy('export-link')
                .should('have.attr', 'href')
                .and('equal', `${Cypress.env('API_URL')}/project/test_project/export?output=json&conversations=false`);
        });
        it('should display an error message when the api request fails', function() {
            cy.visit('/project/test_project/settings');
            cy.dataCy('project-settings-more')
                .click();
            cy.dataCy('admin-settings-menu')
                .find('a')
                .contains('Docker Compose')
                .click();
            cy.dataCy('docker-api-host')
                .click();
            cy.dataCy('docker-api-host')
                .find('input')
                .clear()
                .type(`${Cypress.env('API_URL')}1{enter}`);
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
        });
    });
});
