/* global cy expect */
const storyGroupOne = 'Default stories';

describe('story tree navigation', function() {
    afterEach(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
    });

    const checkItemAtIndex = (index, value) => {
        /*
            the default rety behaviour is to retry the command before the .should
            this means dataCy().eq().should does NOT requery the dom when it retries.
            if the first attempt doesn't succeed none of them will

            to fix this we put the element at index check in the callback of a
            should function so the dataCy query is retried.  this is only
            needed for the first .eq after a change.
        */
        cy.dataCy('story-group-menu-item').should((e) => {
            expect(e[index].innerText).to.be.equal(value);
        });
    };
    
    it('should be possible to delete a story group', function() {
        cy.visit('/project/bf/stories');
        cy.get('#storygroup-tree').should('contain.text', storyGroupOne);
        cy.deleteStoryOrGroup(storyGroupOne, 'story-group');
        cy.get('#storygroup-tree').should('not.contain.text', storyGroupOne);
    });

    it('it should not be possible to delete a story group with a linking origin or destination', function() {
        cy.createStoryGroup();
        cy.createStoryInGroup();
        cy.linkStory('Groupo (1)', 'Greetings');
        cy.deleteStoryOrGroup('Groupo', 'story-group', false); // origin group
        cy.get('.modal').should('contain.text', 'contains links');
        cy.escapeModal();
        cy.deleteStoryOrGroup('Groupo (1)', 'story', false); // origin story
        cy.get('.modal').should('contain.text', 'linked to another story');
        cy.escapeModal();
        cy.deleteStoryOrGroup(storyGroupOne, 'story-group', false); // destination group
        cy.get('.modal').should('contain.text', 'contains links');
        cy.escapeModal();
        cy.deleteStoryOrGroup('Greetings', 'story', false); // destination story
        cy.get('.modal').should('contain.text', 'linked to another story');
        cy.escapeModal();
    });

    it('after name edit, editing should display the right name', function() {
        cy.visit('/project/bf/stories');
        cy.get('#storygroup-tree').should('contain.text', storyGroupOne);
        cy.renameStoryOrGroup(storyGroupOne, 'HALLO');
        cy.get('#storygroup-tree').should('not.contain.text', storyGroupOne);
        cy.createStoryInGroup({ groupName: 'HALLO' });
        cy.dataCy('story-title').should('exist').should('have.value', 'HALLO (3)');
        cy.renameStoryOrGroup('HALLO (3)', 'BYE');
        cy.dataCy('story-title').should('exist').should('have.value', 'BYE');
    });

    it('should be able to add and delete stories', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('story-group-menu-item', null, '[type="story"]').should('have.length', 3);
        cy.createStoryInGroup({ groupName: 'Default stories' });
        cy.dataCy('story-group-menu-item', null, '[type="story"]').should('have.length', 4);
        cy.deleteStoryOrGroup('Greetings');
        cy.dataCy('story-group-menu-item', null, '[type="story"]').should('have.length', 3);
    });

    it('should be able to select multiple stories and show them in the right order', function() {
        cy.visit('/project/bf/stories');
        cy.createStoryInGroup({ groupName: 'Default stories' });
        cy.createStoryInGroup({ groupName: 'Default stories' });
        cy.selectStories('Default stories (3)', 2);
        cy.dataCy('story-title').should('have.length', 2);
        cy.dataCy('story-title').eq(0).should('have.value', 'Default stories (3)');
        cy.dataCy('story-title').eq(1).should('have.value', 'Farewells');
        cy.selectStories('Greetings', 3, 'up');
        cy.dataCy('story-title').should('have.length', 3);
        cy.dataCy('story-title').eq(0).should('have.value', 'Default stories (3)');
        cy.dataCy('story-title').eq(1).should('have.value', 'Farewells');
        cy.dataCy('story-title').eq(2).should('have.value', 'Greetings');
    });

    it('should not be able to select stories from different groups', function() {
        cy.visit('/project/bf/stories');
        cy.selectStories('Greetings', 2);
        cy.dataCy('story-title').should('have.length', 1);
        cy.dataCy('story-title').eq(0).should('have.value', 'Get started');
    });

    it('should be able to move a single story to another group', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('story-group-menu-item').eq(4).should('have.text', 'Get started');
        cy.moveStoryOrGroup({ name: 'Get started' }, { name: 'Default stories' });
        checkItemAtIndex(3, 'Get started');
        cy.dataCy('story-group-menu-item').eq(4).should('have.text', 'Intro stories');
    });

    it('should be able to move 2 stories to another group by moving whichever of 2', function() {
        cy.visit('/project/bf/stories');
        cy.createStoryInGroup({ groupName: 'Default stories' });
        cy.dataCy('story-group-menu-item').eq(1).should('have.text', 'Default stories (3)');
        cy.dataCy('story-group-menu-item').eq(2).should('have.text', 'Farewells');
        cy.selectStories('Default stories (3)', 2);
        cy.moveStoryOrGroup({ name: 'Default stories (3)' }, { name: 'Intro stories' }); // grab first selected item
        cy.dataCy('story-group-menu-item').eq(1).should('have.text', 'Greetings');
        cy.dataCy('story-group-menu-item').eq(2).should('have.text', 'Intro stories');
        checkItemAtIndex(4, 'Default stories (3)');
        cy.dataCy('story-group-menu-item').eq(5).should('have.text', 'Farewells');
    
        cy.moveStoryOrGroup({ name: 'Farewells' }, { name: 'Default stories' }); // grab second selected item and move em back
        cy.dataCy('story-group-menu-item').eq(1).should('have.text', 'Greetings');
        checkItemAtIndex(2, 'Default stories (3)');
        cy.dataCy('story-group-menu-item').eq(3).should('have.text', 'Farewells');
        cy.dataCy('story-group-menu-item').eq(5).should('have.text', 'Get started');
    });

    it('should be able to move stories above or below others', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('story-group-menu-item').eq(1).should('have.text', 'Farewells');
        cy.dataCy('story-group-menu-item').eq(4).should('have.text', 'Get started');
        cy.moveStoryOrGroup({ name: 'Get started' }, { name: 'Farewells' });
        checkItemAtIndex(1, 'Get started');
    
        cy.moveStoryOrGroup({ name: 'Get started' }, { name: 'Farewells' });
        checkItemAtIndex(1, 'Farewells');
        cy.dataCy('story-group-menu-item').eq(2).should('have.text', 'Get started');
    
        cy.selectStories('Get started', 2);
        cy.moveStoryOrGroup({ name: 'Get started' }, { name: 'Farewells' });
        checkItemAtIndex(1, 'Get started');
        cy.dataCy('story-group-menu-item').eq(2).should('have.text', 'Greetings');
    
        cy.selectStories('Get started', 2);
        cy.moveStoryOrGroup({ name: 'Get started' }, { name: 'Farewells' });
        checkItemAtIndex(1, 'Farewells');
        cy.dataCy('story-group-menu-item').eq(2).should('have.text', 'Get started');
        cy.dataCy('story-group-menu-item').eq(3).should('have.text', 'Greetings');
    });

    it('should be able to move a story or group and not lose current selection', function() {
        cy.visit('/project/bf/stories');
        cy.selectStories('Farewells', 2);
        cy.moveStoryOrGroup({ name: 'Get started' }, { name: 'Default stories' });
        cy.moveStoryOrGroup({ name: 'Intro stories' }, { name: 'Default stories' });
        checkItemAtIndex(4, 'Get started');
        cy.dataCy('story-group-menu-item').eq(0).should('have.text', 'Intro stories');
        cy.dataCy('story-title').should('have.length', 2);
        cy.dataCy('story-title').eq(0).should('have.value', 'Farewells');
        cy.dataCy('story-title').eq(1).should('have.value', 'Greetings');
    });

    it('should not be able to move a sg into a sg or a story to the root', function() {
        cy.visit('/project/bf/stories');
        cy.moveStoryOrGroup({ name: 'Intro stories' }, { name: 'Farewells' });
        cy.dataCy('story-group-menu-item').eq(0).should('have.text', 'Intro stories'); // move above group instead
        checkItemAtIndex(4, 'Greetings');
        cy.moveStoryOrGroup({ name: 'Greetings' }); // attempt moving to root
        checkItemAtIndex(4, 'Greetings'); // don't move at all
        cy.moveStoryOrGroup({ name: 'Greetings' }, { index: 1 }); // attempt moving to root between two groups
        checkItemAtIndex(2, 'Greetings'); // moved into group above
        cy.moveStoryOrGroup({ name: 'Greetings' }, { index: 2 }); // attempt moving to last position in root
        checkItemAtIndex(4, 'Greetings');
    });

    it('train button should have the same text on both the NLU and stories page', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('story-group-menu-item', 'Intro stories').findCy('focus-story-group')
            .click({ force: true });
        cy.dataCy('train-button').trigger('mouseover');
        cy.contains('Train NLU and stories from 1 focused story group.');
        cy.dataCy('story-group-menu-item', 'Intro stories').findCy('focus-story-group')
            .click({ force: true });
        cy.dataCy('train-button').trigger('mouseover');
        cy.contains('Train NLU and stories from 1 focused story group.').should('not.exist');
    });

    it('should remember selected story', () => {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Greetings');
        cy.dataCy('incoming-sidebar-link').click({ force: true });
        cy.dataCy('stories-sidebar-link').click({ force: true });
        cy.dataCy('story-title').should('have.value', 'Greetings');
    });
});
