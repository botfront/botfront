/* global cy:true */

const storyGroupOne = 'storyGroupOne';

describe('stories', function() {
    afterEach(function() {
        // cy.logout();
        // cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
    });

    const addStoryToSmartStoryGroup = () => {
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.dataCy('story-title').should('have.value', 'storyGroupOne');
        cy.dataCy('edit-trigger-rules').click();
        cy.dataCy('toggle-website-visits').click();
        cy.dataCy('website-visits-input').click().find('input').type('10');
        cy.dataCy('submit-triggers').click();
        cy.get('.dimmer').should('not.exist');
        cy.dataCy('browser-item').contains('Smart stories').click();
        cy.dataCy('story-title').should('have.value', storyGroupOne);
    };
    
    it('should disable adding, deleting, and moving stories in the smart story group', function() {
        cy.visit('/project/bf/stories');
        addStoryToSmartStoryGroup();
        
        cy.dataCy('browser-item').contains('Smart stories').click();
        cy.dataCy('story-title').should('have.value', storyGroupOne);
        cy.dataCy('add-story').should('not.exist');

        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').should('not.exist');

        cy.dataCy('move-story').click();
        cy.dataCy('confirm-yes').should('not.exist');
    });
    it('should remove a story from the smart story group when it\'s rules are deleted', function() {
        cy.visit('/project/bf/stories');
        addStoryToSmartStoryGroup();
        
        cy.dataCy('edit-trigger-rules').click();
        cy.dataCy('story-rules-editor').find('.close.icon').click();
        cy.dataCy('delete-triggers').click();
        cy.get('.dimmer').should('not.exist');

        cy.dataCy('smart-stories-message').should('exist');
    });
    it('should not be possible to move a story to the smart story group', function() {
        cy.visit('/project/bf/stories');

        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.dataCy('story-title').should('have.value', 'storyGroupOne');

        cy.dataCy('move-story').click();
        cy.dataCy('move-story-dropdown').click();
        cy.dataCy('move-story-dropdown').find('span').should('not.have.text', 'SmartStories');
    });
});
