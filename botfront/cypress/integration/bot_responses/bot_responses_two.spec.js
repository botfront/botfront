/* eslint-disable no-undef */

describe('Bot responses', function() {
    beforeEach(function() {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'fr');
        cy.login();
    });

    afterEach(function() {

    });


    it('Should delete an existing response from the project when it is deleted in a story', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('browser-item').contains('Default stories').click();
        cy.dataCy('bot-response-input').contains('utter_hi').should('exist');
        cy.dataCy('bot-response-input')
            .first()
            .trigger('mouseover');
        cy.dataCy('bot-response-input')
            .first()
            .findCy('trash')
            .click({ force: true });
    });
});
