/* global cy:true */

const storyGroupOne = 'storyGroupOne';
const storyGroupTwo = 'storyGroupTwo';
const testText = '* my_intent';

describe('stories', function() {
    afterEach(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
    });


    function clickStoryGroup(group) {
        const positions = ['topLeft', 'top', 'topRight', 'left', 'center', 'right', 'bottomLeft', 'bottom', 'bottomRight'];
        positions.map(p => cy.contains(group).click(p, { force: true }));
    }

    it('should be able to move a story', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupTwo}{enter}`);
        clickStoryGroup(storyGroupOne);
        clickStoryGroup(storyGroupOne);
        cy.dataCy('story-title').should('have.value', storyGroupOne);
        cy.dataCy('move-story').click({ force: true });
        cy.dataCy('move-story-dropdown').click({ force: true });
        cy.dataCy('move-story-dropdown')
            .find('[role=listbox]')
            .contains(storyGroupTwo)
            .click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
        clickStoryGroup(storyGroupTwo);
        cy.dataCy('story-title')
            .first()
            .should('have.value', storyGroupOne);
        cy.dataCy('story-editor').should('have.lengthOf', 2);
        cy.dataCy('delete-story')
            .first()
            .click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
        cy.dataCy('story-editor').should('have.lengthOf', 1);
        cy.dataCy('delete-story').click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
    });

    it('should be able to add and delete stories', function() {
        // add story group
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.contains('storyGroupOne').click({ force: true });
        // add a second story to the new story group
        cy.dataCy('story-editor').get('textarea');
        cy.dataCy('add-story').click({ force: true });
        cy.dataCy('story-editor').should('have.lengthOf', 2);
        // edits the newly created (second) story title
        cy.dataCy('story-title')
            .eq(1)
            .click()
            .clear()
            .type('ID AKLEJDKSGLJENSKEPFM{enter}');
        // deletes the first story
        cy.dataCy('delete-story')
            .first()
            .click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
        // verifies that the third story was not removed along with the first
        cy.dataCy('browser-item').eq(2).should('have.class', 'active');
        cy.dataCy('story-editor').should('have.lengthOf', 1);
        cy.dataCy('story-title').should('have.value', 'ID AKLEJDKSGLJENSKEPFM');
        // deletes the second story
        cy.dataCy('delete-story').click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
        cy.contains(storyGroupTwo).should('not.exist');
    });

    it('should autosave stories as you edit them', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('add-item').click({ force: true });
        // Create a first story group
        cy.dataCy('add-item-input')
            .find('input')
            .type('Group 1 {enter}');
        // Create a second story group
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type('Group 2 {enter}');
        // Add a story to group 1
        clickStoryGroup('Group 1');
        // Edit story content
        cy.dataCy('story-editor')
            .get('textarea')
            .focus()
            .type('* intent    ', { force: true });
        // Go to group 2
        clickStoryGroup('Group 2');
        // Go back to group 1
        clickStoryGroup('Group 1');
        // We should find the story content we saved...
        cy.contains('* intent').should('exist');
    });

    /* the story duplication is deactivated for now, it may cause issues with response edition
    it('should be able to duplicate a story', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.wait(200);
        cy.dataCy('duplicate-story').click({ force: true });
        cy.dataCy('story-editor').should('have.lengthOf', 2);
        cy.dataCy('delete-story')
            .first()
            .click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
        cy.dataCy('story-editor').should('have.lengthOf', 1);
        cy.wait(200);
        cy.dataCy('delete-story')
            .first()
            .click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
    });
    */

    it('should be able to rename a story', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupTwo}{enter}`);
        clickStoryGroup(storyGroupOne);
        cy.wait(200);
        cy.dataCy('story-title').type(' {selectall}{backspace}newTitle');
        cy.dataCy('story-editor')
            .get('textarea')
            .focus()
            .type('xxx', { force: true });
        clickStoryGroup(storyGroupTwo);
        cy.dataCy('delete-story').click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
        clickStoryGroup(storyGroupOne);
        cy.wait(300);
        cy.dataCy('story-title').should('have.value', 'newTitle');
        cy.dataCy('delete-story').click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
    });

    it('should be able to rename storyGroups and select storyGroups, train button should be in sync with the seleted story groups', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        clickStoryGroup(storyGroupOne);
        cy.dataCy('story-editor')
            .get('textarea')
            .type(`{selectall}{backspace}${testText}`, { force: true });
        cy.wait(500);
        cy.contains(storyGroupOne).trigger('mouseover');
        cy.contains(storyGroupOne).find('[data-cy=ellipsis-menu]').click({ force: true });
        cy.contains(storyGroupOne).find('[data-cy=edit-menu]').click({ force: true });
        // Change name of a story group
        cy.get('[data-cy=edit-name] input')
            .click({ force: true })
            .type('{backspace}{backspace}{backspace}{enter}');
        cy.contains('storyGroup').should('exist');
        // Initially none of the story groups are selected, therefore content in the train button should be 'Train'
        cy.contains('Train everything');
        cy.get('.active > #not-selected').click({ force: true });
        cy.get('#not-selected').click({ force: true });
        // Text in the train button should change after all the stories are selected
        cy.contains('Partial training');
    });

    it('should not be able to add empty story or story group names', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type('{enter}');
        cy.dataCy('browser-item').should('have.lengthOf', 2);
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupTwo}{enter}`);
        clickStoryGroup(storyGroupOne);
        cy.dataCy('story-title').type('{selectall}{backspace}');
        clickStoryGroup(storyGroupTwo);
        cy.dataCy('delete-story').click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
        clickStoryGroup(storyGroupOne);
        cy.dataCy('story-title').should('have.value', storyGroupOne);
        cy.dataCy('delete-story').click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
    });

    it('should be able to delete and add stories in intro stories', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('browser-item').eq(0).click({ force: true });
        cy.dataCy('story-editor').get('textarea');
        cy.dataCy('add-story').click({ force: true });
        cy.dataCy('story-editor').should('have.lengthOf', 2);
        cy.dataCy('delete-story')
            .first()
            .click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
        cy.dataCy('story-editor').should('have.lengthOf', 1);
        cy.dataCy('delete-story').click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
        cy.dataCy('browser-item').should('have.lengthOf', 2);
        cy.dataCy('add-story').click({ force: true });
        cy.dataCy('story-editor').should('have.lengthOf', 1);
    });

    it('should be able to collapse stories and to persist that across application state', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('single-story-editor');
        cy.dataCy('collapse-story-button').click({ force: true });
        cy.dataCy('single-story-editor').should('not.exist');
        cy.contains('NLU').click({ force: true });
        cy.contains('Stories').click({ force: true });
        cy.dataCy('single-story-editor').should('not.exist');
    });

    it('should list all linkable stories', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('stories-linker').click({ force: true });
        // the double children() reach the spans containing the names of stories
        cy.dataCy('stories-linker')
            .find('div')
            .children()
            .children()
            .should('have.lengthOf', 2);
    });

    it('should be only possible to link of leaf stories', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('create-branch').click({ force: true });
        cy.dataCy('branch-label').should('have.length', 2);
        cy.dataCy('create-branch').click({ force: true });
        cy.dataCy('branch-label').should('have.length', 4);
        cy.dataCy('branch-label')
            .eq(1)
            .click({ force: true });
        cy.dataCy('branch-label').should('have.length', 2);
        cy.dataCy('branch-label')
            .first()
            .click({ force: true });
        cy.dataCy('stories-linker').should('not.exist', 'disabled');
        cy.dataCy('branch-label')
            .eq(1)
            .click({ force: true });
        cy.dataCy('stories-linker').should('not.have.class', 'disabled');
        cy.dataCy('branch-label')
            .first()
            .click({ force: true });
        cy.dataCy('branch-label').should('have.length', 4);
        cy.dataCy('branch-label')
            .eq(2)
            .click({ force: true });
        cy.dataCy('stories-linker').should('not.have.class', 'disabled');
        cy.dataCy('branch-label')
            .eq(3)
            .click({ force: true });
        cy.dataCy('stories-linker').should('not.have.class', 'disabled');
    });

    it('should be possible to link and unlink stories', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('story-footer').should('not.have.class', 'linked');
        cy.dataCy('stories-linker')
            .find('div')
            .first()
            .should('have.text', 'Select story');
        cy.dataCy('stories-linker').click({ force: true });
        cy.dataCy('stories-linker')
            .find('div')
            .children()
            .first()
            .click({ force: true });
        cy.dataCy('story-footer').should('have.class', 'linked');
        cy.dataCy('stories-linker')
            .find('div')
            .first()
            .should('have.text', 'Farewells');
        cy.dataCy('stories-linker')
            .find('i')
            .click({ force: true });
        cy.dataCy('story-footer').should('not.have.class', 'linked');
        cy.dataCy('stories-linker')
            .find('div')
            .first()
            .should('have.text', 'Select story');
    });

    it('should be possible to change the linked story', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('story-footer').should('not.have.class', 'linked');
        cy.dataCy('stories-linker')
            .find('div')
            .first()
            .should('have.text', 'Select story');
        cy.dataCy('stories-linker').click({ force: true });
        cy.dataCy('stories-linker')
            .find('div')
            .children()
            .first()
            .click({ force: true });
        cy.dataCy('story-footer').should('have.class', 'linked');
        cy.dataCy('stories-linker')
            .find('div')
            .first()
            .should('have.text', 'Farewells');
        cy.dataCy('stories-linker').click({ force: true });
        cy.dataCy('stories-linker')
            .find('div')
            .children()
            .eq(1)
            .click({ force: true });
        cy.dataCy('story-footer').should('have.class', 'linked');
        cy.dataCy('stories-linker')
            .find('div')
            .first()
            .should('have.text', 'Greetings');
    });

    it('should be possible to self link when a story has branches', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('stories-linker')
            .find('div.item')
            .should('have.lengthOf', 2);
        cy.dataCy('create-branch').click({ force: true });
        cy.dataCy('branch-label').should('exist');
        cy.dataCy('stories-linker')
            .find('div.item')
            .should('have.lengthOf', 3);
        cy.dataCy('stories-linker').click({ force: true });
        cy.dataCy('stories-linker')
            .find('div.item')
            .eq(1)
            .click({ force: true });
        cy.dataCy('story-footer').should('have.class', 'linked');
        cy.dataCy('story-footer')
            .find('div.active')
            .should('have.text', 'Get started');
    });

    it('should disable the delete button in the branch tab for a linked branch and its parent branches', function () {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('create-branch').click({ force: true });
        cy.dataCy('create-branch').click({ force: true });
        cy.dataCy('stories-linker').click({ force: true });
        cy.dataCy('stories-linker')
            .find('div')
            .children()
            .first()
            .click();
        cy.dataCy('story-top-menu')
            .find('.trash.disabled.icon')
            .should('exist');
        cy.dataCy('branch-label')
            .find('.trash.small.disabled');
        cy.dataCy('single-story-editor')
            .last()
            .dataCy('branch-label')
            .find('.trash.small.disabled')
            .should('exist');
        cy.dataCy('single-story-editor')
            .last()
            .dataCy('branch-label')
            .last()
            .click();
        cy.dataCy('single-story-editor')
            .last()
            .dataCy('branch-label')
            .last()
            .find('.trash.small.disabled');
        cy.dataCy('single-story-editor')
            .eq(1)
            .dataCy('branch-label')
            .first()
            .find('.trash.small.disabled');
        cy.dataCy('single-story-editor')
            .eq(1)
            .dataCy('branch-label')
            .last()
            .click();
        cy.dataCy('single-story-editor')
            .eq(1)
            .dataCy('branch-label')
            .last()
            .find('.trash.small.disabled');
    });
    it('should disable the delete button in the story top menu for linked destination stories', function () {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('stories-linker').click({ force: true });
        cy.dataCy('stories-linker')
            .find('div')
            .children()
            .first()
            .click();
        cy.dataCy('browser-item')
            .contains('Default stories')
            .click();
        cy.dataCy('connected-to').should('exist');
        cy.dataCy('story-top-menu')
            .find('.trash.disabled.icon')
            .should('exist');
    });
});
