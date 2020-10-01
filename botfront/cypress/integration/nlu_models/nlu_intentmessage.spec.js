
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

        cy.addExamples(['cya', 'later'], 'byebye');
        cy.dataCy('draft-button').should('not.exist');
        cy.addExamples(['hello', 'hi guys'], 'hihi');
        cy.dataCy('draft-button').should('not.exist');

        // the warning message should not exist
        cy.contains('You need at least two distinct intents to train NLU').should('not.exist');
    });
});
