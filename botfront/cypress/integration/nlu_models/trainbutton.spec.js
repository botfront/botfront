/* eslint-disable no-undef */

describe('Train Button', function() {
    before(function() {
        cy.createProject('bf', 'My Project', 'fr');
    });

    after(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.login();
    });

    it('train button should have the same text on both the NLU and stories page', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input').find('input').type('storyGroupOne{enter}');
        cy.contains('storyGroupOne').click();
        // Selecting a story group
        cy.get('.active > #not-selected').click();
        cy.contains('Partial Training');
        cy.dataCy('train-button').trigger('mouseover');
        cy.contains('Train NLU and stories from 1 focused story group.');
        cy.visit('/project/bf/nlu/models');

        cy.dataCy('train-button').trigger('mouseover');
        cy.contains('Train NLU and stories from 1 focused story group.');
        cy.visit('/project/bf/stories');
        // Cleaning the state
        cy.contains('storyGroupOne').click();
        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
    });
});
