/* global cy Cypress:true */

describe('Exporting a Project', function() {
    beforeEach(function() {
        cy.deleteProject('bf');
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
            cy.visit('/project/bf/settings');
            cy.dataCy('project-settings-menu-import-export').click();
            cy.dataCy('project-settings-menu-import-export').should('have.class', 'active');
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
            cy.dataCy('save-changes')
                .should('not.have.class', 'disabled');
            
            // english and french should be available
            cy.contains('Endpoints').click();
            cy.dataCy('endpoints-environment-menu').should('exist');
            cy.dataCy('project-settings-menu-import-export').click();
            cy.wait(2000);
            cy.dataCy('project-settings-menu-import-export').click();
            cy.dataCy('project-settings-menu-import-export').should('have.class', 'active');
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
