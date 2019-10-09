/* eslint-disable no-undef */
const apiHost = 'http://localhost:8080';
const storyGroupName = 'Account';
const slotName = 'test_slot';
const slotType = 'bool';
const intentExampleText = 'what\'s the date';

const intent = 'date';
const nExamplesOfIntent = 3;

const responseIntent = 'utter_g2FiL5tLA';
const responseText = 'which account would you like to access';

const entityName = 'open';
const entityValue = 'check';

describe('Importing a project', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr');
        cy.login();
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
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    describe('Importing a project user interface', function() {
        it('import story groups', function() {
            cy.visit('/project/bf/stories');
            cy.dataCy('browser-item')
                .contains('Default stories')
                .click();
            cy.dataCy('delete-story')
                .last()
                .click();
            cy.dataCy('confirm-yes')
                .last()
                .click({ force: true });
            cy.dataCy('delete-story')
                .last()
                .click();
            cy.dataCy('confirm-yes')
                .last()
                .click({ force: true });

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
            cy.dataCy('backup-project-button')
                .click();
            cy.contains('Backup successfully downloaded!').should('exist');
            cy.dataCy('import-button')
                .click();
            cy.dataCy('project-import-success').should('exist');

            cy.visit('/project/bf/stories');
            cy.dataCy('browser-item')
                .contains(storyGroupName)
                .should('exist');
            cy.dataCy('browser-item').should('have.lengthOf', 3);
        });
        
        it('should import story contents', function() {
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
            cy.dataCy('backup-project-button')
                .click();
            cy.contains('Backup successfully downloaded!').should('exist');
            cy.dataCy('import-button')
                .click();
            cy.dataCy('project-import-success').should('exist');

            cy.visit('/project/bf/stories');
            cy.dataCy('browser-item')
                .contains(storyGroupName)
                .click();
            cy.contains('* access_account').should('exist');
            cy.contains(' - utter_g2FiL5tLA').should('exist');
            cy.contains('* access_account_checking').should('exist');
            cy.contains(' - utter_DKsIE1c4O').should('exist');
            cy.dataCy('branch-label')
                .eq(1)
                .click();
            cy.contains('* access_account_saving').should('exist');
            cy.contains(' - utter_kgLzUkBmR').should('exist');
        });
        it('import slots', function() {
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
            cy.dataCy('backup-project-button')
                .click();
            cy.contains('Backup successfully downloaded!').should('exist');
            cy.dataCy('import-button')
                .click();
            cy.dataCy('project-import-success').should('exist');

            cy.visit('/project/bf/stories');
            cy.dataCy('slots-tab')
                .click();
            cy.dataCy('slot-editor').should('have.lengthOf', 1);
            cy.dataCy('slot-editor')
                .find('input')
                .invoke('val')
                .should('have.string', slotName);
            cy.dataCy('slot-editor')
                .find('b')
                .contains(slotType);
        });
        it('import slots', function() {
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
            cy.dataCy('backup-project-button')
                .click();
            cy.contains('Backup successfully downloaded!').should('exist');
            cy.dataCy('import-button')
                .click();
            cy.dataCy('project-import-success').should('exist');

            cy.visit('/project/bf/nlu/models');
            cy.contains(intentExampleText)
                .closest('.rt-tr')
                .contains(intent)
                .should('exist');
            for (let iDeleteNLU = 0; iDeleteNLU < nExamplesOfIntent; iDeleteNLU += 1) {
                cy.dataCy('nlu-table-intent')
                    .contains(intent)
                    .closest('.rt-tr')
                    .find('.trash')
                    .click({ force: true });
                cy.contains('Insert many').click();
                cy.contains('Examples').click();
            }
            cy.contains('Insert many').click();
            cy.contains('Examples').click();
            cy.dataCy('nlu-table-intent')
                .contains(intent)
                .should('not.exist');
        });
        
        it('import responses', function() {
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
            cy.dataCy('backup-project-button')
                .click();
            cy.contains('Backup successfully downloaded!').should('exist');
            cy.dataCy('import-button')
                .click();
            cy.dataCy('project-import-success').should('exist');

            cy.visit('/project/bf/dialogue/templates');
            cy.contains(responseIntent)
                .closest('.rt-tr')
                .contains(responseText)
                .should('exist');
            cy.dataCy('template-intent')
                .should('have.length', 8);
        });
        it('import responses', function() {
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
            cy.dataCy('backup-project-button')
                .click();
            cy.contains('Backup successfully downloaded!').should('exist');
            cy.dataCy('import-button')
                .click();
            cy.dataCy('project-import-success').should('exist');

            cy.visit('/project/bf/nlu/models');
            cy.dataCy('entity-label')
                .should('have.lengthOf', 4);
            cy.dataCy('entity-label')
                .contains(entityValue)
                .closest('[data-cy=entity-label]')
                .contains(entityName);
        });
    });
});
