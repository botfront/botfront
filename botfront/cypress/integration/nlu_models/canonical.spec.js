/* global cy:true */

describe('NLU canonical examples', function () {
    beforeEach(function () {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'fr');
        cy.visit('/login');
        cy.login();
    });

    after(function () {
        cy.deleteProject('bf');
    });
    
    it('should be possible to mark an example as canonical', function () {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello');
        cy.dataCy('intent-dropdown').click();
        cy.get('[data-cy=intent-dropdown] > .search').type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('icon-gem')
            .should('have.class', 'grey');
        cy.dataCy('icon-gem')
            .click({ force: true });
        cy.wait(100);
        cy.dataCy('icon-gem')
            .should('have.class', 'black');
    });

    it('should display a popup for canonical example', function () {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello');
        cy.dataCy('intent-dropdown').click();
        cy.get('[data-cy=intent-dropdown] > .search').type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('icon-gem')
            .should('have.class', 'grey');
        cy.dataCy('icon-gem')
            .click({ force: true });
        cy.wait(100);
        cy.dataCy('icon-gem')
            .should('have.class', 'black');
        cy.dataCy('icon-gem')
            .trigger('mouseover');
        cy.get('.popup').should('exist');
        cy.get('.popup .content').should('have.text', 'This example is canonical for the intent intenttest');
    });

    it('should not be possible to delete or edit a canonical example', function () {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello');
        cy.dataCy('intent-dropdown').click();
        cy.get('[data-cy=intent-dropdown] > .search').type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('icon-gem')
            .click({ force: true });
        cy.wait(100);
        cy.dataCy('icon-trash')
            .should('have.class', 'disabled-delete');
        cy.dataCy('intent-label').trigger('mouseover');
        cy.get('.popup').should('not.exist');
        cy.dataCy('utterance-text').trigger('mouseover');
        cy.get('.popup').should('not.exist');
    });

    it('should be possible switch canonical examples ', function () {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello\nwelcome');
        cy.dataCy('intent-dropdown').click();
        cy.get('[data-cy=intent-dropdown] > .search').type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('icon-gem')
            .first()
            .click({ force: true });
        cy.wait(100);
        cy.dataCy('icon-gem')
            .eq(1)
            .click({ force: true });
        cy.wait(100);
        cy.dataCy('gem')
            .children()
            .should('have.class', 'black');
        cy.get('.s-alert-box-inner').should('exist');
        // just match the first part of the message as linebreaks may happen and are difficult to match
        cy.get('.s-alert-box-inner').should('contain.text',
            'The previous canonical example with');
        cy.dataCy('icon-gem')
            .first()
            .should('have.class', 'grey');
        cy.dataCy('icon-gem')
            .eq(1)
            .should('have.class', 'black');
    });


    it('should be possible display only canonical examples ', function () {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello\nwelcome');
        cy.dataCy('intent-dropdown').click();
        cy.get('[data-cy=intent-dropdown] > .search').type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('icon-gem')
            .first()
            .click({ force: true });
        cy.wait(100);
        cy.contains('welcome').should('exist');
        cy.dataCy('only-canonical').find('input').click({ force: true });
        cy.dataCy('only-canonical').should('have.class', 'checked');
        cy.contains('hello').should('exist');
        cy.contains('welcome').should('not.exist');
    });
    
    it('canonical should be unique per intent, entity and entity value', function () {
        // firstly import all the testing data
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-settings').click();
        cy.contains('Import').click();
        cy.fixture('nlu_import_canonical.json', 'utf8').then((content) => {
            cy.get('.file-dropzone').upload(content, 'data.json');
        });
        cy.contains('Import Training Data').click();
        cy.get('.s-alert-success').should('be.visible');
        cy.visit('/project/bf/nlu/models');
        cy.contains('Training Data').click();
        // we should be able to mark all those as canonical
        /* .each may cause the test to not pass as its detach the
        element from the DOM */
        cy.dataCy('icon-gem').eq(0).click({ force: true });
        cy.wait(200);
        cy.dataCy('icon-gem').eq(1).click({ force: true });
        cy.wait(200);
        cy.dataCy('icon-gem').eq(2).click({ force: true });
        cy.wait(200);
        cy.dataCy('icon-gem').eq(3).click({ force: true });
        cy.wait(200);
        cy.dataCy('icon-gem').eq(4).click({ force: true });
        cy.wait(200);
        cy.dataCy('icon-gem').eq(5).click({ force: true });
        cy.wait(200);
        cy.get('.black[data-cy=icon-gem]').should('have.length', 6);
    });
});
