/* eslint-disable no-undef */

const RESPONSE_TEXT = 'test delete';
const STORY_NAME = 'myStory';
const GROUP_NAME = 'myGroup';

const createResponse = () => {
    cy.dataCy('from-text-template').click({ force: true });
    cy.dataCy('bot-response-input')
        .find('textarea').should('be.empty');
    cy.dataCy('bot-response-input')
        .find('textarea')
        .clear()
        .type(RESPONSE_TEXT)
        .blur();
};

describe('Bot responses', function() {
    beforeEach(function() {
        cy.createProject('bf').then(() => cy.login());
        cy.createStoryGroup({ groupName: GROUP_NAME });
        cy.createStoryInGroup({ groupName: GROUP_NAME, storyName: STORY_NAME });
    });

    afterEach(function() {
        cy.deleteProject('bf');
    });

    const retryResponsePageCheck = (assert) => {
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('responses-screen').should(() => {
            cy.visit('/project/bf/dialogue/templates');
            assert();
        });
    };

    it('Should delete an existing response from the project when it is deleted in a story', function() {
        createResponse();
        cy.wait(500);
        cy.dataCy('icon-trash')
            .click({ force: true });
        cy.wait(500);
        cy.dataCy('bot-response-input').should('not.exist');
        retryResponsePageCheck(() => {
            cy.dataCy('no-responses').should('exist');
        });
    });

    it('Should delete a response in a story from the project when the story is deleted', function() {
        createResponse();
        retryResponsePageCheck(() => {
            cy.dataCy('response-text').should('contain.text', RESPONSE_TEXT);
        });

        cy.visit('/project/bf/stories');
        cy.deleteStoryOrGroup(STORY_NAME, 'story');
        cy.wait(500);
        
        retryResponsePageCheck(() => {
            cy.dataCy('no-responses').should('exist');
        });
    });

    it('Should delete an existing response from the project when the story group is deleted', function() {
        createResponse();
        cy.visit('/project/bf/dialogue/templates');
        retryResponsePageCheck(() => {
            cy.dataCy('response-text').should('contain.text', RESPONSE_TEXT);
        });
        
        
        cy.visit('/project/bf/stories');
        cy.deleteStoryOrGroup(STORY_NAME, 'story');
        cy.wait(500);
        cy.visit('/project/bf/dialogue/templates');
        // to properly retry the visit must be done again
        retryResponsePageCheck(() => {
            cy.dataCy('no-responses').should('exist');
        });
    });
    
    it('Should delete a response in a branch when the branch is deleted', function() {
        cy.dataCy('create-branch').click();
        cy.dataCy('add-branch').click();
        cy.dataCy('branch-label').should('have.length', 3);
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
        cy.wait(500);
        // check the correct bot responses were deleted from the project
        retryResponsePageCheck(() => {
            cy.dataCy('response-text').contains('first response should not exist').should('not.exist');
            cy.dataCy('response-text').contains('second response should not exist').should('not.exist');
            cy.dataCy('response-text').contains('third response should exist').should('exist');
        });
    });
});
