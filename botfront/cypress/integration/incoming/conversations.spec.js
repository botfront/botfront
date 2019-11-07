/* eslint-disable no-undef */
const apiHost = 'http://localhost:8080';

describe('incoming page', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
        cy.visit('/project/bf/settings');
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
        cy.visit('/project/bf/settings');
        cy.contains('Import/Export').click();
        cy.dataCy('import-type-dropdown')
            .click();
        cy.dataCy('import-type-dropdown')
            .find('span')
            .contains('Botfront')
            .click();
        cy.fixture('botfront_project_import.json', 'utf8').then((content) => {
            cy.get('.file-dropzone').upload(content, 'data.json');
        });
        cy.dataCy('skip')
            .click();
        cy.get('.dimmer').find('.ui.primary.button').click();
        cy.dataCy('import-button')
            .click();
        cy.dataCy('project-import-success').should('exist');
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
        cy.dataCy('conversations-next-page')
            .click();
        cy.dataCy('conversations-next-page')
            .should('not.exist');
        cy.dataCy('conversations-previous-page')
            .click();
        cy.dataCy('conversations-previous-page')
            .should('not.exist');
    });
});
