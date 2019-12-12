/* eslint-disable no-undef */

function clickStoryGroup(group) {
    const positions = ['topLeft', 'top', 'topRight', 'left', 'center', 'right', 'bottomLeft', 'bottom', 'bottomRight'];
    positions.map(p => cy.contains(group).click(p, { force: true }));
}

describe('Bot responses', function() {
    beforeEach(function() {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'fr');
        cy.login();
    });

    afterEach(function() {
        cy.deleteProject('bf');
    });


    it('Should delete an existing response from the project when it is deleted in a story', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type('myTest{enter}');
        clickStoryGroup('myTest');

        cy.dataCy('from-text-template').click({ force: true });
        cy.dataCy('bot-response-input')
            .find('textarea').should('be.empty');
        cy.dataCy('bot-response-input')
            .find('textarea')
            .clear()
            .type('test delete response default');
        
        cy.dataCy('bot-response-input')
            .first()
            .findCy('icon-trash')
            .click({ force: true });
        cy.dataCy('bot-response-input').should('not.exist');

        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('response-text').contains('test delete response default').should('not.exist');
    });

    it('Should delete an existing response from the project when it is deleted in a story', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type('myTest{enter}');
        clickStoryGroup('myTest');

        cy.dataCy('from-text-template').click({ force: true });
        cy.dataCy('bot-response-input')
            .find('textarea').should('be.empty');
        cy.dataCy('bot-response-input')
            .find('textarea')
            .clear()
            .type('test delete response delete story');
        
        // add a story so that the story group is not deleted
        // ensuring that this test only tests deleting responses when a story is deleted
        cy.dataCy('add-story').click();
        cy.dataCy('delete-story').first().click();
        cy.dataCy('confirm-yes').click({ force: true });
        
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('response-text').contains('test delete response delete story').should('not.exist');
    });

    it('Should delete an existing response from the project when it is deleted in a story', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type('myTest{enter}');
        clickStoryGroup('myTest');

        cy.dataCy('from-text-template').click({ force: true });
        cy.dataCy('bot-response-input')
            .find('textarea').should('be.empty');
        cy.dataCy('bot-response-input')
            .find('textarea')
            .clear()
            .type('delete storyGroup test response');
        
        
        cy.dataCy('browser-item')
            .contains('myTest')
            .parents('[data-cy=browser-item]')
            .findCy('ellipsis-menu')
            .click({ force: true })
            .findCy('delete-menu')
            .click({ force: true });
        cy.get('.ui.primary.button').contains('Delete').click();
     
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('response-text').contains('delete storyGroup test response').should('not.exist');
    });
    
    it('Should delete an existing response from the project when it is deleted in a story', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type('myTest{enter}');
        clickStoryGroup('myTest');

        cy.dataCy('create-branch').click();
        cy.dataCy('add-branch').click();
        cy.dataCy('branch-menu')
            .first()
            .findCy('branch-label')
            .last()
            .should('have.class', 'active');
        cy.dataCy('create-branch').click();

        cy.getBranchEditor(1).findCy('from-text-template').click({ force: true });
        cy.dataCy('bot-response-input')
            .find('textarea').should('be.empty');
        cy.dataCy('bot-response-input')
            .find('textarea')
            .clear()
            .type('first response should not exist');
        
        cy.getBranchEditor(2).findCy('from-text-template').click({ force: true });
        cy.dataCy('bot-response-input').should('have.length', 2);
        cy.dataCy('bot-response-input')
            .last()
            .find('textarea').should('be.empty');
        cy.dataCy('bot-response-input')
            .last()
            .find('textarea')
            .clear()
            .type('second response should not exist');

        cy.dataCy('branch-menu')
            .first()
            .findCy('branch-label')
            .first()
            .click();
        
        cy.getBranchEditor(1).findCy('from-text-template').click({ force: true });
        cy.dataCy('bot-response-input')
            .find('textarea').should('be.empty');
        cy.dataCy('bot-response-input')
            .find('textarea')
            .clear()
            .type('third response should exist');


        cy.dataCy('branch-menu')
            .first()
            .findCy('branch-label')
            .last()
            .click();
        cy.dataCy('branch-menu')
            .first()
            .findCy('branch-label')
            .last()
            .should('have.class', 'active');
        cy.dataCy('branch-menu')
            .first()
            .findCy('branch-label')
            .last()
            .trigger('mouseover');
        cy.wait(250);
        cy.dataCy('delete-branch')
            .eq(2)
            .click({ force: true });
        cy.dataCy('confirm-yes')
            .click({ force: true });
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('response-text').contains('first response should not exist').should('not.exist');
        cy.dataCy('response-text').contains('second response should not exist').should('not.exist');
        cy.dataCy('response-text').contains('third response should exist').should('exist');
    });
});
