/* global cy */

describe('nlu tagging in training data', function() {
    before(function() {});

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => {
            cy.login();
            cy.importNluData('bf', 'nlu_import.json', 'fr');
        });
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('should be able to change the intent with a popup', function() {
        cy.visit('/project/bf/nlu/models');
        cy.get('.row:contains(chitchat.presentation)')
            .eq(1)
            .findCy('intent-label')
            .click({ force: true })
            .type('chitchat.tell_me_a_joke{enter}');
        cy.get('.row:contains(chitchat.tell_me_a_joke)');
    });

    it('should delete the training data', function() {
        cy.visit('/project/bf/nlu/models');
        cy.get('.row:contains(chitchat.presentation)')
            .eq(1)
            .findCy('icon-trash')
            .click({ force: true });
        cy.get('.row:contains(chitchat.presentation)').should('have.length', 1);
    });

    it('should be able to change an entity with a popup', function() {
        cy.visit('/project/bf/nlu/models');
        cy.pause();
        cy.get('.row:contains(chitchat.presentation)')
            .eq(1)
            .findCy('entity-label')
            .click();
        cy.dataCy('entity-dropdown')
            .find('input')
            .type('person{enter}');
        cy.get('.row:contains(person)');
    });
});
