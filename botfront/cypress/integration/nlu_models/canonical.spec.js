/* global cy:true */

describe('NLU canonical examples', function () {
    beforeEach(function () {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
    });

    after(function () {
        cy.deleteProject('bf');
    });
    
    it('should be possible to mark an example as canonical', function () {
        cy.visit('/project/bf/nlu/models');
        cy.insertNluExamples('bf', 'fr', [
            { text: 'hello', intent: 'chitchat.greet' },
            { text: 'BONJOUR!', intent: 'chitchat.greet' },
        ]);
        cy.dataCy('icon-gem')
            .last()
            .should('not.have.class', 'black');
        cy.dataCy('icon-gem')
            .first()
            .should('have.class', 'black')
            .trigger('mouseover');
        cy.get('.popup').should('exist');
        cy.get('.popup .content').should('have.text', 'This example is canonical for the intent chitchat.greet');
        cy.dataCy('icon-gem')
            .last()
            .click({ force: true });
        cy.wait(100);
        cy.dataCy('icon-gem')
            .last()
            .should('have.class', 'black');
        cy.dataCy('icon-gem')
            .first()
            .should('not.have.class', 'black');
    });

    it('should not be possible to delete or edit a canonical example', function () {
        cy.visit('/project/bf/nlu/models');
        cy.insertNluExamples('bf', 'fr', [
            { text: 'hello', intent: 'chitchat.greet' },
        ]);
        cy.dataCy('icon-trash').should('not.exist');
        cy.dataCy('intent-label').trigger('mouseover');
        cy.get('.popup').should('contain', 'Remove');
        cy.dataCy('utterance-text').trigger('mouseover');
        cy.get('.popup').should('contain', 'Remove');
    });

    it('should be possible display only canonical examples ', function () {
        cy.visit('/project/bf/nlu/models');
        cy.insertNluExamples('bf', 'fr', [
            { text: 'hello', intent: 'chitchat.greet' },
            { text: 'BONJOUR', intent: 'chitchat.greet' },
        ]);
        cy.get('.row').should('have.length', 2);
        cy.dataCy('only-canonical').find('input').click({ force: true });
        cy.dataCy('only-canonical').should('have.class', 'checked');
        cy.get('.row').should('have.length', 1);
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

    it('should not be possible to delete or edit a selection containing a canonical example', function () {
        cy.visit('/project/bf/nlu/models');
        cy.insertNluExamples('bf', 'fr', [
            { text: 'hello', intent: 'chitchat.greet' },
            { text: 'hi', intent: 'chitchat.greet' },
            { text: 'hey', intent: 'chitchat.greet' },
        ]);
        cy.get('.row').eq(0).click().should('have.class', 'selected');
        cy.get('body').type('{shift}', { release: false });
        cy.get('.row').eq(2).click();
        cy.get('.row.selected').should('have.length', 3);
        cy.get('body').type('{shift}');
        cy.get('.virtual-table').focus();
        cy.dataCy('edit-intent').trigger('mouseover', { force: true });
        cy.get('.popup').should('have.text', 'Cannot change intent as the selection contains canonicals');
        cy.dataCy('edit-intent').trigger('mouseout', { force: true });
        cy.dataCy('trash-shortcut').trigger('mouseover', { force: true });
        cy.get('.popup').should('have.text', 'Cannot delete with a selection containing canonicals');
        cy.get('body').type('d');
        cy.get('.row.selected').should('have.length', 3);
        cy.get('body').type('i');
        cy.dataCy('intent-shortcut-popup').should('not.exist');
    });
});
