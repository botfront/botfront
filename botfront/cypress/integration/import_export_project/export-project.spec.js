/* eslint-disable no-undef */
const apiHost = 'http://localhost:8080';


describe('Exporting a Project', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr');
        cy.login();
        cy.visit('/project/bf/settings')
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
            .type(`${apiHost}{enter}`);
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    describe('Export UI', function() {
        it('should navigate the UI for exporting to Botfront', function() {
            cy.visit('/project/bf/settings');
            cy.contains('Import/Export').click();
            cy.get('.ui.pointing.secondary')
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

        it('should navigate the UI for exporting to Rasa/Rasa X', function() {
            cy.visit('/project/bf/settings');
            cy.contains('Import/Export').click();
            cy.get('.ui.pointing.secondary')
                .find('.item')
                .contains('Export')
                .click();
            cy.dataCy('export-type-dropdown')
                .click()
                .find('span')
                .contains('Rasa')
                .click();
            cy.dataCy('export-language-dropdown')
                .click()
                .find('span')
                .first()
                .click();
            cy.dataCy('export-button')
                .click();
            cy.contains('Your project has been successfully exported for Rasa/Rasa X!').should('exist');
        });
    });

    // it('should be able to import an exported file', function() {
    //     cy.visit('/project/bf/settings');
    //     cy.contains('Import/Export').click();
    //     cy.get('.ui.pointing.secondary')
    //         .find('.item')
    //         .contains('Export')
    //         .click();
    //     cy.dataCy('export-type-dropdown')
    //         .click()
    //         .find('span')
    //         .contains('Botfront')
    //         .click();
    //     cy.dataCy('export-button')
    //         .click();
    //     cy.contains('Your project has been successfully exported for Botfront!').should('exist');
    // });
});
