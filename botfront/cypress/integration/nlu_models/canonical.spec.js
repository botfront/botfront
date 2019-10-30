/* eslint-disable no-undef */

describe('NLU Batch Insert', function () {
    before(function () {
        cy.createProject('bf', 'My Project', 'fr');
    });

    beforeEach(function () {
        cy.visit('/login');
        cy.login();
    });

    after(function () {
        cy.deleteProject('bf');
    });

    it('should be possible to mark an example as canonical', function () {
        cy.visit('/project/bf/nlu/models');
        cy.get('.nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello');
        cy.get('.purple > .ui').click();
        cy.get('.purple > .ui > .search').type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('gem')
            .children()
            .should('have.class', 'grey');
        cy.dataCy('gem')
            .children()
            .click({ force: true });
        cy.wait(100);
        cy.dataCy('gem')
            .children()
            .should('have.class', 'black');
    });

    it('should display a popup for canonical example', function () {
        cy.visit('/project/bf/nlu/models');
        cy.get('.nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello');
        cy.get('.purple > .ui').click();
        cy.get('.purple > .ui > .search').type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('gem')
            .children()
            .should('have.class', 'grey');
        cy.dataCy('gem')
            .children()
            .click({ force: true });
        cy.wait(100);
        cy.dataCy('gem')
            .children()
            .should('have.class', 'black');
        cy.dataCy('gem')
            .children()
            .trigger('mouseover');
        cy.get('.popup').should('exist');
        // have.text concat inner text, that is why intentintenttest does not have space
        cy.get('.popup .content').should('have.text', 'This example is canonical for the intentintenttest');
    });

    it('should not be possible to delete or edit a canonical example', function () {
        cy.visit('/project/bf/nlu/models');
        cy.get('.nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello');
        cy.get('.purple > .ui').click();
        cy.get('.purple > .ui > .search').type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('gem')
            .children()
            .click({ force: true });
        cy.wait(100);
        cy.dataCy('trash')
            .children()
            .should('have.class', 'disabled-delete');
        cy.dataCy('nlu-table-intent').trigger('mouseover');
        cy.get('.popup').should('exist');
        cy.get('.popup').should('have.text', 'Cannot edit a canonical example');
        cy.dataCy('nlu-table-intent').trigger('mouseover');
        cy.dataCy('nlu-table-text').trigger('mouseover');
        cy.get('.popup').should('exist');
        cy.get('.popup').should('have.text', 'Cannot edit a canonical example');
    });

    it('should be possible switch canonical examples ', function () {
        cy.visit('/project/bf/nlu/models');
        cy.get('.nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello\nwelcome');
        cy.get('.purple > .ui').click();
        cy.get('.purple > .ui > .search').type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.contains('hello')
            .closest('.rt-tr')
            .find('[data-cy=gem]')
            .children()
            .click({ force: true });
        cy.wait(100);
        cy.contains('welcome')
            .closest('.rt-tr')
            .find('[data-cy=gem]')
            .children()
            .click({ force: true });
        cy.wait(100);
        cy.get('.s-alert-box-inner').should('exist');
        // just match the first part of the message as linebreaks may happen and are difficult to match
        cy.get('.s-alert-box-inner').should('contain.text',
            'The previous canonical example with');
        cy.contains('hello')
            .closest('.rt-tr')
            .find('[data-cy=gem]')
            .children()
            .should('have.class', 'grey');
        cy.contains('welcome')
            .closest('.rt-tr')
            .find('[data-cy=gem]')
            .children()
            .should('have.class', 'black');
    });


    it('should be possible display only canonical examples ', function () {
        cy.visit('/project/bf/nlu/models');
        cy.get('.nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello\nwelcome');
        cy.get('.purple > .ui').click();
        cy.get('.purple > .ui > .search').type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.contains('hello')
            .closest('.rt-tr')
            .find('[data-cy=gem]')
            .children()
            .click({ force: true });
        cy.wait(100);
        cy.contains('welcome').should('exist');
        cy.dataCy('only-canonical').find('input').click({ force: true });
        cy.contains('hello').should('exist');
        cy.contains('welcome').should('not.exist');
    });

    it('canonical should be unique per intent, entity and entity value', function () {
        // firstly import all the testing data
        cy.visit('/project/bf/nlu/models');
        cy.get('.nlu-menu-settings').click();
        cy.contains('Import').click();
        cy.fixture('nlu_import_canonical.json', 'utf8').then((content) => {
            cy.get('.file-dropzone').upload(content, 'data.json');
        });
        cy.contains('Import Training Data').click();
        cy.get('.s-alert-success').should('be.visible');
        cy.visit('/project/bf/nlu/models');
        cy.contains('Training Data').click();
        // we should be able to mark all those as canonical
        cy.dataCy('gem').children().click({ force: true, multiple: true });
        cy.dataCy('gem').children().should('have.class', 'black');
    });
});
