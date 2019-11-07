/* eslint-disable no-undef */
const apiHost = 'http://localhost:8080';

const actionA = 'test_action_a';
const actionB = 'test_action_b';

describe('incoming page', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
        cy.waitForResolve(Cypress.env('RASA_URL'));
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });
    const addEntities = () => {
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
        cy.fixture('botfront_conversations_project.json', 'utf8').then((content) => {
            cy.get('.file-dropzone').upload(content, 'data.json');
        });
        cy.dataCy('skip')
            .click();
        cy.get('.dimmer')
            .find('.ui.primary.button')
            .contains('OK')
            .click();
        cy.dataCy('import-button')
            .click();
        cy.dataCy('project-import-success').should('exist');
    };
    /*
    it('should filter by length and confidence', function() {
        addEntities();
        cy.visit('/project/bf/incoming');
        cy.dataCy('incoming-conversations-tab')
            .click();
        cy.wait(100);
        cy.dataCy('length-filter')
            .find('input')
            .type('5');
        cy.wait(100);
        // assertion here
        cy.dataCy('length-filter')
            .find('.filter-dropdown')
            .click()
            .find('div')
            .contains('Less than')
            .click();
        cy.wait(100);
        // assertion here
        cy.dataCy('length-filter')
            .find('.filter-dropdown')
            .click()
            .find('div')
            .contains('Equals')
            .click();
        cy.wait(100);
        // assertion here
        cy.dataCy('confidence-filter')
            .find('input')
            .type('75');
        cy.wait(100);
        // assertion here
        cy.dataCy('confidence-filter')
            .find('.filter-dropdown')
            .click()
            .find('div')
            .contains('Less than')
            .click();
        cy.wait(100);
        // assertion here
    });
    */
    it('should filter by action', function() {
        addEntities();
        cy.visit('/project/bf/incoming');
        cy.dataCy('incoming-conversations-tab')
            .click();
        cy.dataCy('action-filter')
            .find('.filter-dropdown')
            .click()
            .find('input')
            .type(`${actionA}{enter}`);
        cy.wait(100);
        // assertion here
        cy.dataCy('action-filter')
            .find('.filter-dropdown')
            .click('topLeft')
            .find('input')
            .type(`${actionB}{enter}`);
        cy.wait(100);
        // assertion here
        cy.dataCy('action-filter')
            .click()
            .find('.label')
            .contains(actionA)
            .find('.icon')
            .click();
        cy.dataCy('action-filter')
            .click({ force: true })
            .find('.label')
            .contains(actionA)
            .should('not.exist');
        // assertion here
    });
});
