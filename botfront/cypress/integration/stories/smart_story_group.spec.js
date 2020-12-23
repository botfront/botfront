/* global cy:true */

describe('stories', function() {
    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
    });

    const addStoryToSmartStoryGroup = () => {
        cy.createStoryGroup();
        cy.createFragmentInGroup();
        cy.dataCy('story-group-menu-item', 'Groupo (1)').should('have.length', 1);
        cy.dataCy('edit-trigger-rules').click();
        cy.dataCy('toggle-website-visits').click();
        cy.dataCy('website-visits-input').click().find('input').type('10');
        cy.dataCy('submit-triggers').click();
        cy.get('.dimmer').should('not.exist');
        cy.dataCy('story-group-menu-item', 'Groupo (1)').should('have.length', 2);
    };
    
    it('should disable adding, deleting in the smart story group', function() {
        cy.visit('/project/bf/dialogue');
        addStoryToSmartStoryGroup();
        cy.dataCy('story-group-menu-item', 'Groupo (1)').eq(0).as('story');
        cy.dataCy('story-group-menu-item', 'Stories with triggers').as('story-group');
        cy.get('@story-group').find('.item-actions').children().should('have.length', 0);
        cy.get('@story-group').find('.item-name').should('have.class', 'uneditable');
        cy.get('@story').find('.item-actions').children().should('have.length', 0);
        cy.get('@story').find('.drag-handle').should('have.class', 'hidden');
        cy.get('@story').find('.item-name').should('have.class', 'uneditable');
    });
    it('should remove a story from the smart story group when its rules are deleted', function() {
        cy.visit('/project/bf/dialogue');
        addStoryToSmartStoryGroup();
        
        cy.dataCy('edit-trigger-rules').click();
        cy.dataCy('story-rules-editor').find('.close.icon').click();
        cy.dataCy('delete-triggers').click();
        cy.get('.dimmer').should('not.exist');

        cy.dataCy('story-group-menu-item', 'Groupo (1)').should('have.length', 1);
    });
});
