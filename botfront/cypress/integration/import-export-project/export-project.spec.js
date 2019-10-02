/* eslint-disable no-undef */

describe('Project Endpoints', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr');
        cy.login();
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    describe('Exporting a project UI only', function() {
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
            cy.contains('Your project has been successfully exported for Botfront!').should('exist');
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
});
