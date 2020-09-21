/* global cy */
const storyGroupOne = 'Default stories';

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

describe('form navigation in the story menu', () => {
    beforeEach(() => {
        cy.createProject('bf', 'trial', 'fr');
        cy.login();
        cy.visit('/project/bf/stories');
    });

    afterEach(() => {
        cy.logout();
        cy.deleteProject('bf');
    });
    it('should be able to add and delete forms', () => {
        cy.dataCy('story-group-menu-item', null, '[type="form"]').should('not.exist');
        cy.createFormInGroup({ groupName: 'Default stories' });
        cy.wait(1000);
        cy.dataCy('story-group-menu-item', null, '[type="form"]').should('exist');
        cy.deleteStoryOrGroup('Defaultstories_form');
        cy.dataCy('story-group-menu-item', null, '[type="form"]').should('not.exist');
    });

    it('should not be able to select multiple forms', () => {
        cy.createCustomStoryGroup('bf', 'FORM_GROUP', 'Form group');
        cy.dataCy('story-group-menu-item').should('include.text', 'Form group');
        cy.createForm('bf', 'test_1_form', { groupId: 'FORM_GROUP', _id: 'form1' });
        cy.createForm('bf', 'test_2_form', { groupId: 'FORM_GROUP', _id: 'form2' });
        cy.dataCy('story-group-menu-item').should('include.text', 'test_2_form');
        cy.visit('/project/bf/stories?ids%5B%5D=form1&ids%5B%5D=form2');
        cy.get('.form-graph-wrapper').should('have.length', 1);
    });
    it('should be able to move a form between story groups', () => {
        cy.createCustomStoryGroup('bf', 'FORM_GROUP', 'Form group');
        cy.createCustomStoryGroup('bf', 'DEST_GROUP', 'Dest group');
        cy.dataCy('story-group-menu-item').should('include.text', 'Form group');
        cy.createForm('bf', 'test_1_form', { groupId: 'FORM_GROUP', _id: 'form1' });
        cy.dataCy('story-group-menu-item').should('include.text', 'test_1_form');
        cy.moveStoryOrGroup({ name: 'test_1_form' });
        cy.checkMenuItemAtIndex(2, 'test_1_form');
        cy.moveStoryOrGroup({ name: 'test_1_form' }, { name: 'Dest group' });
        cy.checkMenuItemAtIndex(1, 'test_1_form');
    });
});

describe('story tree navigation', function() {
    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
        cy.visit('/project/bf/stories');
        cy.createStoryGroup({ groupName: 'Groupi' });
        cy.dataCy('story-group-menu-item').should('have.length', 7);
        cy.createStoryInGroup({ groupName: 'Groupi' });
        cy.dataCy('story-group-menu-item').should('have.length', 8);
        cy.createStoryGroup();
        cy.dataCy('story-group-menu-item').should('have.length', 9);
        cy.createStoryInGroup();
        cy.dataCy('story-group-menu-item').should('have.length', 10);
        cy.createStoryInGroup();
        cy.dataCy('story-group-menu-item').should('have.length', 11);
    });
    
    it('should be possible to delete a story group', function() {
        cy.get('#storygroup-tree').should('contain.text', storyGroupOne);
        cy.deleteStoryOrGroup(storyGroupOne, 'story-group');
        cy.get('#storygroup-tree').should('not.contain.text', storyGroupOne);
    });

    it('it should not be possible to delete a story group with a linking origin or destination', function() {
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
        cy.get('#storygroup-tree').should('contain.text', storyGroupOne);
        cy.renameStoryOrGroup(storyGroupOne, 'HALLO');
        cy.get('#storygroup-tree').should('not.contain.text', storyGroupOne);
        cy.createStoryInGroup({ groupName: 'HALLO' });
        cy.dataCy('story-title').should('exist').should('have.value', 'HALLO (4)');
        cy.renameStoryOrGroup('HALLO (4)', 'BYE');
        cy.dataCy('story-title').should('exist').should('have.value', 'BYE');
    });

    it('should be able to add and delete stories', function() {
        cy.dataCy('story-group-menu-item', null, '[type="story"]').should('have.length', 6);
        cy.createStoryInGroup({ groupName: 'Default stories' });
        cy.dataCy('story-group-menu-item', null, '[type="story"]').should('have.length', 7);
        cy.deleteStoryOrGroup('Default stories (4)');
        cy.dataCy('story-group-menu-item', null, '[type="story"]').should('have.length', 6);
    });

    it('should be able to select multiple stories and show them in the right order', function() {
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
        cy.selectStories('Groupo (1)', 2);
        cy.dataCy('story-title').should('have.length', 1);
        cy.dataCy('story-title').eq(0).should('have.value', 'Groupi (1)');
    });

    it('should be able to move a single story to another group', function() {
        cy.checkMenuItemAtIndex(2, 'Groupo (1)');
        cy.moveStoryOrGroup({ name: 'Groupo (1)' }, { name: 'Groupi' });
        cy.checkMenuItemAtIndex(4, 'Groupo (1)');
    });

    it('should be able to move 2 stories to another group by moving whichever of 2', function() {
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
        cy.visit('/project/bf/stories');
        cy.wait(1000);
        cy.browseToStory('Groupo (1)');
        cy.dataCy('incoming-sidebar-link').click({ force: true });
        cy.dataCy('stories-sidebar-link').click({ force: true });
        cy.wait(200);
        cy.dataCy('story-title').should('have.value', 'Groupo (1)');
    });
});
