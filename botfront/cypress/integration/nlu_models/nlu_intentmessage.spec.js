
/* global cy:true */

describe('NLU Intent warning message displays', function() {
    before(function() {
        cy.createProject('bf', 'My Project', 'en');
    });

    beforeEach(function() {
        cy.visit('/login');
        cy.login();
    });

    afterEach(function() {
        cy.deleteProject('bf');
        cy.logout();
    });

    it('Should add and delete multiple examples', function() {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.wait(100);
        // check warning message exists
        cy.wait(300); // wait for the ui to update
        cy.contains('You need at least two distinct intents to train NLU').should('exist');

        // create first intent
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('cya\nlater');
        cy.dataCy('intent-label')
            .click({ force: true })
            .type('newintent{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.get('[data-cy=save-button]').should('not.have.property', 'disabled');

        // create second intent
        cy.contains('Examples').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello\nhi guys');
        cy.dataCy('intent-label')
            .click({ force: true })
            .type('intent1{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.get('[data-cy=save-button]').should('not.have.property', 'disabled');

        // returns to the example tab
        cy.contains('Examples').click();
        cy.wait(300); // wait for the ui to update
        // the warning message should not exist
        cy.contains('You need at least two distinct intents to train NLU').should('not.exist');
    });
});
