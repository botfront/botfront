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
        cy.get('.batch-insert-input').type('hello{enter}hi');
        cy.dataCy('intent-label')
            .first()
            .click({ force: true })
            .type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('icon-gem')
            .last()
            .should('not.have.class', 'active');
        cy.dataCy('icon-gem')
            .first()
            .should('have.class', 'active');
        cy.dataCy('icon-gem')
            .last()
            .click({ force: true });
        cy.wait(100);
        cy.dataCy('icon-gem')
            .last()
            .should('have.class', 'active');
        cy.dataCy('icon-gem')
            .first()
            .should('not.have.class', 'active');
    });

    it('should display a popup for canonical example', function () {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello');
        cy.dataCy('intent-label')
            .click({ force: true })
            .type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('icon-gem')
            .should('have.class', 'active');
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
        cy.dataCy('intent-label')
            .click({ force: true })
            .type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('icon-trash')
            .should('have.class', 'disabled');
        cy.dataCy('intent-label').trigger('mouseover');
        cy.get('.popup').should('contain', 'Cannot edit');
        cy.dataCy('utterance-text').trigger('mouseover');
        cy.get('.popup').should('contain', 'Cannot edit');
    });

    it('should be possible switch canonical examples ', function () {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello\nwelcome');
        cy.dataCy('intent-label')
            .click({ force: true })
            .type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('icon-gem')
            .last()
            .click({ force: true });
        cy.get('.s-alert-box-inner').should('exist');
        cy.dataCy('icon-gem')
            .should('have.class', 'active');
        // just match the first part of the message as linebreaks may happen and are difficult to match
        cy.get('.s-alert-box-inner').should('contain.text',
            'The previous canonical example with');
        cy.dataCy('icon-gem')
            .first()
            .should('not.have.class', 'active');
        cy.dataCy('icon-gem')
            .last()
            .should('have.class', 'active');
    });


    it('should be possible display only canonical examples ', function () {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello\nwelcome');
        cy.dataCy('intent-label')
            .click({ force: true })
            .type('intenttest{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.contains('welcome').should('exist');
        cy.dataCy('only-canonical').find('input').click({ force: true });
        cy.dataCy('only-canonical').should('have.class', 'checked');
        cy.contains('hello').should('exist');
        cy.contains('welcome').should('not.exist');
    });

    it('canonical should be unique per intent, entity and entity value', function () {
        // firstly import all the testing data
        cy.visit('/project/bf/nlu/models');
        cy.importNluData('bf', 'nlu_import_canonical.json', 'fr');
        cy.contains('Training Data').click();
        // All the imported examples should have been marked automatically as canonical ones
        cy.dataCy('icon-gem', null, '.black').should('have.length', 6);
    });
    
    
    it('should tag the first example for an intent created in the visual editor as canonical', function () {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Farewells');
        cy.dataCy('add-user-line').click({ force: true });
        cy.dataCy('user-line-from-input').last().click({ force: true });
        cy.addUserUtterance('this example should be canonical', 'intenttest', 1);
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('icon-gem').should('have.class', 'black');
    });
});
