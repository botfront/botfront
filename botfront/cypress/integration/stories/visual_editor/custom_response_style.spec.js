/* global cy:true */

describe('Bot responses', function() {
    beforeEach(function() {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login());
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });
    it('should create a custom response using the response editor', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type('myTest{enter}');
        cy.dataCy('story-title').should('have.value', 'myTest');
        cy.wait(1000); // wait for the story to load
        cy.dataCy('from-text-template').click({ force: true });
        cy.wait(1000); // wait for the bot response to be created
        cy.dataCy('single-story-editor').trigger('mouseover');
        cy.dataCy('edit-responses').click({ force: true });
        cy.dataCy('metadata-tab').click();
        cy.dataCy('response-editor').find('.item').contains('Message appearance').click();
        cy.dataCy('toggled-').click({ force: true });
        cy.dataCy('style-dropdown').click().find('span').contains('Specify custom css style')
            .click({ force: true });
        cy.dataCy('response-editor').find('textarea').click().type('background-color: blue;');
        cy.wait(500);
        cy.get('.dimmer').click({ position: 'topLeft' });
        cy.get('.dimmer').should('not.exist');
        cy.dataCy('bot-response-input').should('have.css', 'background-color', 'rgb(0, 0, 255)');
    });
});
