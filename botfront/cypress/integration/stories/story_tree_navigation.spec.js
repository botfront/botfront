/* global cy */
const storyGroupOne = 'Example group';

const insertPinnedGroup = n => cy.MeteorCall('storyGroups.insert', [
    {
        _id: `pinned${n}`,
        pinned: true,
        projectId: 'bf',
        name: `Pinned group ${n}`,
    },
]);

const deleteSmartGroups = () => {
    cy.get('#storygroup-tree').then((tree) => {
        const highlighted = tree.find('.item-focus-holder.blue');
        if (highlighted.length > 0) {
            Array.from(highlighted).map(
                n => n.id.replace(/^story-menu-item-/, ''),
            ).forEach(_id => cy.MeteorCall('storyGroups.delete', [{ _id, projectId: 'bf' }]));
        }
    });
};

const populateMenu = () => {
    cy.createCustomStoryGroup('bf', 'test_group_a', 'Groupi');
    cy.createCustomStoryGroup('bf', 'test_group_b', 'Groupo');
    cy.createCustomStory('bf', 'test_group_a', 'test_Story_a', { title: 'Groupi (1)' });
    cy.createCustomStory('bf', 'test_group_b', 'test_Story_b', { title: 'Groupo (1)' });
    cy.createCustomStory('bf', 'test_group_b', 'test_Story_c', { title: 'Groupo (2)' });
    cy.get('[data-cy=story-group-menu-item]:not([type="story-group"])').should('have.length', 6);
};

describe('story tree navigation', function() {
    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
        cy.visit('/project/bf/dialogue');
    });
    
    it('should be possible to delete a story group', function() {
        cy.get('#storygroup-tree').should('contain.text', storyGroupOne);
        cy.deleteStoryOrGroup(storyGroupOne, 'story-group');
        cy.get('#storygroup-tree').should('not.contain.text', storyGroupOne);
    });

    it('it should not be possible to delete a story group with a linking origin or destination', function() {
        populateMenu();
        cy.linkStory('Groupo (1)', 'Groupi (1)');
        cy.deleteStoryOrGroup('Groupo', 'story-group', false); // origin group
        cy.get('.modal').should('contain.text', 'contains links');
        cy.escapeModal();
        cy.deleteStoryOrGroup('Groupo (1)', 'story', false); // origin story
        cy.get('.modal').should('contain.text', 'linked to another story');
        cy.escapeModal();
        cy.deleteStoryOrGroup('Groupi', 'story-group', false); // destination group
        cy.get('.modal').should('contain.text', 'contains links');
        cy.escapeModal();
        cy.deleteStoryOrGroup('Groupi (1)', 'story', false); // destination story
        cy.get('.modal').should('contain.text', 'linked to another story');
        cy.escapeModal();
    });

    it('after name edit, editing should display the right name', function() {
        cy.get('#storygroup-tree').should('contain.text', storyGroupOne);
        cy.renameStoryOrGroup(storyGroupOne, 'HALLO');
        cy.get('#storygroup-tree').should('not.contain.text', storyGroupOne);
        cy.createStoryInGroup({ groupName: 'HALLO' });
        cy.dataCy('story-title').should('exist').should('have.value', 'HALLO (4)');
        cy.renameStoryOrGroup('HALLO (4)', 'BYE');
        cy.dataCy('story-title').should('exist').should('have.value', 'BYE');
    });

    it('should be able to add and delete stories', function() {
        cy.dataCy('story-group-menu-item', null, ':not([type="story-group"])').should('have.length', 3);
        cy.createStoryInGroup({ groupName: 'Example group' });
        cy.dataCy('story-group-menu-item', null, ':not([type="story-group"])').should('have.length', 4);
        cy.deleteStoryOrGroup('Example group (4)');
        cy.dataCy('story-group-menu-item', null, ':not([type="story-group"])').should('have.length', 3);
    });

    it('should be able to select multiple stories and show them in the right order', function() {
        populateMenu();
        cy.createStoryInGroup();
        cy.selectStories('Groupo (3)', 2);
        cy.dataCy('story-title').should('have.length', 2);
        cy.dataCy('story-title').eq(0).should('have.value', 'Groupo (3)');
        cy.dataCy('story-title').eq(1).should('have.value', 'Groupo (2)');
        cy.selectStories('Groupo (1)', 3, 'up');
        cy.dataCy('story-title').should('have.length', 3);
        cy.dataCy('story-title').eq(0).should('have.value', 'Groupo (3)');
        cy.dataCy('story-title').eq(1).should('have.value', 'Groupo (2)');
        cy.dataCy('story-title').eq(2).should('have.value', 'Groupo (1)');
    });

    it('should not be able to select stories from different groups', function() {
        populateMenu();
        cy.selectStories('Groupo (1)', 2);
        cy.dataCy('story-title').should('have.length', 1);
        cy.dataCy('story-title').eq(0).should('have.value', 'Groupi (1)');
    });

    it('should be able to move a single story to another group', function() {
        populateMenu();
        cy.checkMenuItemAtIndex(2, 'Groupo (1)');
        cy.moveStoryOrGroup({ name: 'Groupo (1)' }, { name: 'Groupi' });
        cy.checkMenuItemAtIndex(4, 'Groupo (1)');
    });

    it('should be able to move 2 stories to another group by moving whichever of 2', function() {
        populateMenu();
        cy.checkMenuItemAtIndex(1, 'Groupo (2)');
        cy.checkMenuItemAtIndex(2, 'Groupo (1)');
        cy.selectStories('Groupo (2)', 2);

        cy.moveStoryOrGroup({ name: 'Groupo (2)' }, { name: 'Groupi' }); // grab first selected item
        cy.checkMenuItemAtIndex(3, 'Groupo (2)');
        cy.checkMenuItemAtIndex(4, 'Groupo (1)');
    
        cy.moveStoryOrGroup({ name: 'Groupo (1)' }, { name: 'Groupo' }); // grab second selected item and move em back
        cy.checkMenuItemAtIndex(1, 'Groupo (2)');
        cy.checkMenuItemAtIndex(2, 'Groupo (1)');
    });

    it('should be able to move stories above or below others', function() {
        populateMenu();
        cy.checkMenuItemAtIndex(4, 'Groupi (1)');
        cy.moveStoryOrGroup({ name: 'Groupi (1)' }, { name: 'Groupo (2)' });
        cy.checkMenuItemAtIndex(1, 'Groupi (1)');
    
        cy.moveStoryOrGroup({ name: 'Groupi (1)' }, { name: 'Groupo (2)' });
        cy.checkMenuItemAtIndex(1, 'Groupo (2)');
        cy.checkMenuItemAtIndex(2, 'Groupi (1)');
    
        cy.selectStories('Groupi (1)', 2);
        cy.moveStoryOrGroup({ name: 'Groupi (1)' }, { name: 'Groupo (2)' });
        cy.checkMenuItemAtIndex(1, 'Groupi (1)');
        cy.checkMenuItemAtIndex(2, 'Groupo (1)');
    
        cy.selectStories('Groupi (1)', 2);
        cy.moveStoryOrGroup({ name: 'Groupi (1)' }, { name: 'Groupo (2)' });
        cy.checkMenuItemAtIndex(1, 'Groupo (2)');
        cy.checkMenuItemAtIndex(2, 'Groupi (1)');
        cy.checkMenuItemAtIndex(3, 'Groupo (1)');
    });

    it('should be able to move a story or group and not lose current selection', function() {
        populateMenu();
        cy.selectStories('Groupo (2)', 2);
        cy.moveStoryOrGroup({ name: 'Groupi (1)' }, { name: 'Groupo' });
        cy.checkMenuItemAtIndex(3, 'Groupi (1)');
        cy.moveStoryOrGroup({ name: 'Groupi', type: 'story-group' }, { name: 'Groupo' });
        cy.checkMenuItemAtIndex(0, 'Groupi');
        cy.dataCy('story-title').should('have.length', 2);
        cy.dataCy('story-title').eq(0).should('have.value', 'Groupo (2)');
        cy.dataCy('story-title').eq(1).should('have.value', 'Groupo (1)');
    });

    it('should not be able to move a sg into a sg or a story to the root', function() {
        populateMenu();
        cy.dataCy('story-group-menu-item').then((els) => {
            const pinned = Array.from(els).filter(el => el.attributes['data-pinned'].value === 'true').length;
            cy.moveStoryOrGroup({ name: 'Groupi' }, { name: 'Groupo (2)' });
            cy.checkMenuItemAtIndex(0, 'Groupi'); // move above group instead
            cy.checkMenuItemAtIndex(4, 'Groupo (1)');
            cy.moveStoryOrGroup({ name: 'Groupo (1)' }); // attempt moving to root
            cy.checkMenuItemAtIndex(4, 'Groupo (1)'); // don't move at all
            cy.log('attempt moving to root between two groups');
            cy.moveStoryOrGroup({ name: 'Groupo (1)' }, { index: pinned + 1 });
            cy.checkMenuItemAtIndex(2, 'Groupo (1)'); // moved into group above
            cy.log('attempt moving to last position in root');
            cy.moveStoryOrGroup({ name: 'Groupo (1)' }, { index: pinned + 2 });
            cy.checkMenuItemAtIndex(4, 'Groupo (1)');
        });
    });

    it('should always display pinned groups on top', () => {
        populateMenu();
        insertPinnedGroup(2);
        insertPinnedGroup(1);
        deleteSmartGroups();
        cy.checkMenuItemAtIndex(0, 'Pinned group 1', false);
        cy.checkMenuItemAtIndex(1, 'Pinned group 2', false);
        cy.checkMenuItemAtIndex(2, 'Groupo', false);
        cy.checkMenuItemAtIndex(5, 'Groupi', false);
        cy.log('attempt moving into pinned region');
        cy.moveStoryOrGroup({ name: 'Groupi' }, { name: 'Pinned group 1' });
        cy.checkMenuItemAtIndex(2, 'Groupi', false); // instead moved as close as possible
        cy.checkMenuItemAtIndex(4, 'Groupo', false);
        cy.log('attempt moving out of pinned region');
        cy.moveStoryOrGroup({ name: 'Pinned group 1' }, { name: 'Groupo (1)' });
        cy.checkMenuItemAtIndex(0, 'Pinned group 2', false); // instead moved as close as possible
        cy.checkMenuItemAtIndex(1, 'Pinned group 1', false);
    });

    it('train button should have the same text on both the NLU and stories page', function() {
        populateMenu();
        cy.dataCy('story-group-menu-item', 'Groupi').findCy('focus-story-group')
            .click({ force: true });
        cy.dataCy('focus-story-group', null, '.focused').should('have.length', 1);
        cy.wait(500);
        cy.dataCy('train-button').trigger('mouseover');
        cy.contains('Train NLU and stories from 1 focused story group.');
        cy.dataCy('story-group-menu-item', 'Groupi').findCy('focus-story-group')
            .click({ force: true });
        cy.dataCy('focus-story-group', null, '.focused').should('have.length', 0);
        cy.wait(500);
        cy.dataCy('train-button').trigger('mouseover');
        cy.contains('Train NLU and stories from 1 focused story group.').should('not.exist');
    });

    it('should remember selected story', () => {
        populateMenu();
        cy.visit('/project/bf/dialogue');
        cy.browseToStory('Groupo (1)');
        cy.dataCy('incoming-sidebar-link').click({ force: true });
        cy.dataCy('dialogue-sidebar-link').click({ force: true });
        cy.dataCy('story-title').should('have.value', 'Groupo (1)');
    });
});
