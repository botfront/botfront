/* eslint-disable no-undef */

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
        it('should navigate the UI for exporting to Rasa/Rasa X', function() {
            cy.visit('/project/test_project/settings');
            cy.contains('Import/Export').click();
            cy.dataCy('port-project-menu')
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

        it('should list project languages in the language dropdown', function() {
            // French should be available
            // English should not be available
            cy.visit('/project/test_project/settings');
            cy.contains('Import/Export').click();
            cy.dataCy('port-project-menu')
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
                .contains('French')
                .should('exist');
            cy.dataCy('export-language-dropdown')
                .click()
                .find('span')
                .contains('English')
                .should('not.exist');
                
            // add english to the project langauges
            cy.contains('Project Info')
                .click();
            cy.dataCy('language-selector')
                .click()
                .find('span')
                .contains('English')
                .click();
            cy.dataCy('save-changes')
                .click({ force: true });
            
            // english and french should be available
            cy.contains('Import/Export').click();
            cy.dataCy('port-project-menu')
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
                .contains('French')
                .should('exist');
            cy.dataCy('export-language-dropdown')
                .click()
                .find('span')
                .contains('English')
                .should('exist');
        });
    });
});
