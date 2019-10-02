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

    describe('Importing a project user interface', function() {
        it('Should navigate the UI for importing a botfront project', function() {
            cy.visit('/project/bf/settings');
            cy.contains('Import/Export').click();
            cy.dataCy('import-type-dropdown')
                .click();
            cy.dataCy('import-type-dropdown')
                .find('span')
                .contains('Botfront')
                .click();
            cy.fixture('nlu_import.json', 'utf8').then((content) => {
                cy.get('.file-dropzone').upload(content, 'data.json');
            });
            cy.dataCy('backup-project-button')
                .click();
            cy.contains('Backup successfully downloaded!').should('exist');
            cy.dataCy('import-button')
                .click();
            cy.dataCy('project-imported').should('exist');
        });
    });
});
