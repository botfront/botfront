/* global cy:true */

const utterance = 'whatever this is a testing utterance';
const intentName = 'KPI';
const secondIntent = 'chitchat.greet';
const newIntent = 'test';
const newRenameIntent = 'KKPPII';
const secondEntity = 'ENT2';
const newEntity = 'myNewEntity';

describe('nlu tagging in training data', function() {
    before(function() {});

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => {
            cy.login();
            cy.visit('/project/bf/nlu/models');
            cy.dataCy('nlu-menu-settings').click();
            cy.contains('Import').click();
            cy.fixture('nlu_import.json', 'utf8').then((content) => {
                cy.get('.file-dropzone').upload(content, 'data.json');
            });
            cy.contains('Import Training Data').click();
        });
    });

    afterEach(function() {
        cy.deleteProject('bf');
    });

    it('Should add training data', function() {
        cy.visit('/project/bf/nlu/models');
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type(utterance);
        cy.dataCy('intent-dropdown').click();
        cy.get('[data-cy=intent-dropdown] > .search').type(intentName);
        cy.get('[role=listbox]')
            .contains(intentName)
            .click();
        cy.get('[data-cy=save-button]').click();
        cy.visit('/project/bf/nlu/models');
        cy.get('.rt-tbody .rt-tr:first').should('contain', utterance);
        cy.get('.rt-tbody .rt-tr:first')
            .contains(intentName).should('exist');
    });

    // TODO: this test doesn't test anything
    it('should be able to change the intent with a popup', function() {
        cy.visit('/project/bf/nlu/models');
        cy.get('.rt-tbody .rt-tr:first')
            .contains('chitchat.presentation')
            .trigger('mouseover');

        cy.get('[data-cy=intent-dropdown]').click();
        cy.get('[data-cy=intent-dropdown]')
            .contains('chitchat.tell_me_a_joke')
            .click();

        cy.get('.rt-tbody .rt-tr:first').contains('chitchat.tell_me_a_joke');

        // This doesn't work ( as in the popup never disappears)
        // cy.get('.rt-tbody .rt-tr:first').contains(utterance).trigger('mouseover').click();

        // cy.get('[data-cy=intent-popup]').should('not.exist');
    });

    it('should be able to change the intent with a new intent', function() {
        cy.visit('/project/bf/nlu/models');
        cy.get('.rt-tbody .rt-tr:first')
            .contains('chitchat.presentation')
            .trigger('mouseover');

        cy.get('[data-cy=intent-dropdown]').click();
        cy.get('[data-cy=intent-dropdown] input').type(`${newIntent}{enter}`);

        cy.get('.rt-tbody .rt-tr:first').contains(newIntent);

        // cy.wait(1000);
        // cy.get('.rt-tbody .rt-tr:first')
        //     .contains(utterance)
        //     .click();

        // cy.get('[data-cy=intent-popup]').should('not.exist');
    });

    it('should delete the training data', function() {
        cy.visit('/project/bf/nlu/models');
        cy.get('.rt-tbody .rt-tr:first [data-cy=trash] .viewOnHover').click({
            force: true,
        });
        cy.get('.rt-tbody .rt-tr:first').should('not.contain', utterance);
    });

    it('should be able to change an entity with a popup', function() {
        cy.visit('/project/bf/nlu/models');
        cy.get('.rt-tbody .rt-tr:first')
            .contains('Matthieu')
            .trigger('mouseover');

        cy.get('[data-cy=entity-dropdown]').click();
        cy.get('[data-cy=entity-dropdown]')
            .contains(secondEntity)
            .click();

        // cy.get('[data-cy=trigger-entity-names]').click();

        cy.get('.rt-tbody .rt-tr:first').contains(secondEntity);

        cy.visit('/project/bf/nlu/models');
        cy.contains('Training Data').click();
        // cy.get('[data-cy=trigger-entity-names]').click();

        cy.get('.rt-tbody .rt-tr:first').contains(secondEntity);
    });

    it('should be able to change an entity with a popup to a new entity', function() {
        cy.visit('/project/bf/nlu/models');
        cy.get('.rt-tbody .rt-tr:first')
            .contains('Matthieu')
            .trigger('mouseover');

        cy.get('[data-cy=entity-dropdown]').click();
        cy.get('[data-cy=entity-dropdown] input').type(`${newEntity}{enter}`);

        // cy.get('[data-cy=trigger-entity-names]').click();

        cy.get('.rt-tbody .rt-tr:first').contains(newEntity);

        cy.visit('/project/bf/nlu/models');
        cy.contains('Training Data').click();
        // cy.get('[data-cy=trigger-entity-names]').click();

        cy.get('.rt-tbody .rt-tr:first').contains(newEntity);
    });
});
