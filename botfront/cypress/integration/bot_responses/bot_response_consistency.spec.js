/* eslint-disable no-undef */

function clickStoryGroup(group) {
    const positions = ['topLeft', 'top', 'topRight', 'left', 'center', 'right', 'bottomLeft', 'bottom', 'bottomRight'];
    positions.map(p => cy.contains(group).click(p, { force: true }));
}

describe('Bot responses', function() {
    beforeEach(function() {
        cy.createProject('bf').then(() => cy.login());
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
        cy.wait(500);
        cy.dataCy('icon-trash')
            .click({ force: true });
        cy.wait(500);
        cy.dataCy('bot-response-input').should('not.exist');
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('no-responses').should('exist');
    });

    it('Should delete a response in a story from the project when the story is deleted', function() {
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
        cy.dataCy('single-story-editor').should('have.length', 2);

        cy.dataCy('delete-story').first().click();
        cy.dataCy('confirm-yes').click({ force: true });
        
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('no-responses').should('exist');
    });

    it('Should delete an existing response from the project when the story group is deleted', function() {
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

        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type('myTest{enter}');
        clickStoryGroup('myTest');
     
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('no-responses').should('exist');
    });
    
    it('Should delete a response in a branch when the branch is deleted', function() {
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


        cy.dataCy('branch-label')
            .eq(2)
            .click({ click: true });
        // delete branch is unclickable in cypress for ~100ms
        cy.wait(250);
        cy.dataCy('branch-label')
            .eq(2)
            .trigger('mouseover');
        cy.wait(250);
        cy.dataCy('delete-branch')
            .eq(2)
            .click({ force: true })
            .dataCy('confirm-yes')
            .click({ force: true });
        // check the correct bot responses were deleted from the project
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('response-text').contains('first response should not exist').should('not.exist');
        cy.dataCy('response-text').contains('second response should not exist').should('not.exist');
        cy.dataCy('response-text').contains('third response should exist').should('exist');
    });
});
