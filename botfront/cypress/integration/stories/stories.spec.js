/* eslint-disable no-undef */

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
            .get('[role=listbox]')
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
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.contains('storyGroupOne').click({ force: true });
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
        cy.contains(storyGroupTwo).should('not.exist');
    });

    it('should autosave stories as you edit them', function() {
        cy.visit('/project/bf/stories');
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
            .type('xxx', { force: true });
        // Go to group 2
        clickStoryGroup('Group 2');
        // Go back to group 1
        clickStoryGroup('Group 1');
        // We should find the story content we saved...
        cy.contains('xxx').should('exist');
    });

    it('should be able to duplicate a story', function() {
        cy.visit('/project/bf/stories');
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

    it('should be able to rename a story', function() {
        cy.visit('/project/bf/stories');
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
        cy.contains(storyGroupOne).find('[data-cy=edit-name-icon]').click({ force: true });
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

        cy.contains('storyGroup').click({ force: true });
        cy.dataCy('delete-story').click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
        cy.get('.active > #selected').click({ force: true });
    });

    it('should not be able to add empty story or story group names', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type('{enter}');
        cy.dataCy('browser-item').should('have.lengthOf', 1);
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
        cy.dataCy('add-story').click({ force: true });
        cy.dataCy('story-editor').should('have.lengthOf', 1);
    });
});
