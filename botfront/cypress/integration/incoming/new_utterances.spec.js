/* eslint-disable no-undef */

describe('incoming page', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
        cy.waitForResolve(Cypress.env('RASA_URL'));
        cy.request('DELETE', `${Cypress.env('RASA_URL')}/model`);
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    const addNewUtterances = () => {
    // add utterances with populate
        cy.visit('/project/bf/incoming');
        cy.dataCy('incoming-populate-tab')
            .click();
        cy.get('textarea')
            .click()
            .type('test{enter}testing{enter}checking');
        cy.get('button')
            .contains('Add Utterances')
            .click();
        // define intents of new utterances
        cy.dataCy('incoming-newutterances-tab')
            .click();
        cy.dataCy('null-nlu-table-intent')
            .first()
            .click();
        cy.dataCy('intent-dropdown')
            .trigger('mouseOver')
            .click()
            .find('input')
            .trigger('mouseOver')
            .type('test{enter}');
        cy.dataCy('null-nlu-table-intent')
            .first()
            .click();
        cy.dataCy('intent-dropdown')
            .trigger('mouseOver')
            .click()
            .find('input')
            .trigger('mouseOver')
            .type('test2{enter}');
        cy.dataCy('null-nlu-table-intent')
            .first()
            .click();
        cy.dataCy('intent-dropdown')
            .trigger('mouseOver')
            .click()
            .find('input')
            .trigger('mouseOver')
            .type('test{enter}');
    };

    it('should show available languages in the language selector', function() {
        cy.visit('/project/bf/incoming');
        // check project language exists
        cy.dataCy('language-selector')
            .click()
            .find('span')
            .contains('English')
            .should('exist');
        cy.dataCy('language-selector')
            .click()
            .find('span')
            .contains('French')
            .should('not.exist');
        // add another language
        cy.visit('/project/bf/settings');
        cy.dataCy('language-selector')
            .click({ force: true })
            .find('.item')
            .contains('French')
            .click({ force: true });
        cy.dataCy('save-changes')
            .click({ force: true });
        // check both languages are available
        cy.visit('/project/bf/incoming');
        cy.dataCy('language-selector')
            .click()
            .find('span')
            .contains('English')
            .should('exist');
        cy.dataCy('language-selector')
            .click()
            .find('span')
            .contains('French')
            .should('exist');
    });


    it('should be able to link to evaluation from new utterances', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('train-button')
            .click();
        cy.wait(1000);
        cy.get('[data-cy=train-button]').should('not.have.class', 'disabled');
        // add utterances with populate
        addNewUtterances();
        // validate utterances and run evaluation
        cy.dataCy('invalid-utterance-button')
            .first()
            .click();
        cy.dataCy('invalid-utterance-button')
            .first()
            .click();
        cy.dataCy('process-valid-utterances')
            .click();
        cy.dataCy('choose-action-dropdown')
            .click()
            .find('.item')
            .contains('Run evaluation')
            .click({ force: true });
        cy.dataCy('confirm-action')
            .click();
        cy.get('.dimmer')
            .find('button')
            .contains('OK')
            .click();
        // check it linked to evalutaion > validated utterances
        cy.contains('Use validated examples')
            .should('exist');
        cy.get('.active')
            .contains('Use validated examples')
            .should('exist');
    });

    it('should be able to add new utterances to nlu', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('train-button')
            .click();
        cy.wait(1000);
        cy.get('[data-cy=train-button]').should('not.have.class', 'disabled');
        // add utterances with populate
        addNewUtterances();
        cy.get('.rt-tbody')
            .find('.rt-tr-group')
            .first()
            .find('span')
            .contains('checking')
            .should('exist');
        // validate utterances and run evaluation
        cy.dataCy('invalid-utterance-button')
            .first()
            .click();
        cy.dataCy('invalid-utterance-button')
            .first()
            .click();
        cy.dataCy('process-valid-utterances')
            .click();
        cy.dataCy('choose-action-dropdown')
            .click()
            .find('.item')
            .contains('Add to training data')
            .click({ force: true });
        cy.dataCy('confirm-action')
            .click();
        cy.get('.dimmer')
            .find('button')
            .contains('OK')
            .click();
        cy.get('.rt-tbody')
            .find('.rt-tr-group')
            .first()
            .find('span')
            .contains('checking')
            .should('not.exist');
        // check utterances were added to nlu data
        cy.get('.project-sidebar')
            .find('.item')
            .contains('NLU')
            .click({ force: true });
        cy.get('.rt-td')
            .find('span')
            .contains('checking')
            .should('exist');
        cy.get('.rt-td')
            .find('span')
            .contains('checking')
            .should('exist');
        cy.dataCy('nlu-table-intent')
            .contains('test')
            .should('exist');
    });

    it('should be able to invalidate utterances', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('train-button')
            .click();
        cy.wait(1000);
        cy.get('[data-cy=train-button]').should('not.have.class', 'disabled');
        // add utterances with populate
        addNewUtterances();
        cy.dataCy('invalid-utterance-button')
            .first()
            .click();
        cy.dataCy('invalid-utterance-button')
            .first()
            .click();
        cy.dataCy('process-valid-utterances')
            .click();
        cy.dataCy('choose-action-dropdown')
            .click()
            .find('.item')
            .contains('Invalidate')
            .click({ force: true });
        cy.dataCy('confirm-action')
            .click();
        cy.get('.dimmer')
            .find('button')
            .contains('OK')
            .click();
        cy.dataCy('valid-utterance-button')
            .should('not.exist');
    });
});
