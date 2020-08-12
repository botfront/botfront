/* global cy Cypress:true */

describe('Exporting a Project', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => {
            cy.login();
        });
        cy.waitForResolve(Cypress.env('RASA_URL'));
        cy.request('DELETE', `${Cypress.env('RASA_URL')}/model`);
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    describe('Export UI', function() {
        it('should navigate the UI for exporting to Rasa/Rasa X', function() {
            cy.visit('/project/bf/settings');
            cy.dataCy('project-settings-menu-import-export').click();
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
            cy.visit('/project/bf/settings');
            cy.dataCy('project-settings-menu-import-export').click();
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
            cy.dataCy('project-settings-menu-info').click();
            cy.dataCy('language-selector')
                .click()
                .find('span')
                .contains('English')
                .click();
            cy.dataCy('save-changes')
                .click({ force: true });
            
            // english and french should be available
            cy.dataCy('project-settings-menu-import-export').click();
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
