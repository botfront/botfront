/* eslint-disable no-undef */

const storyGroupOne = 'storyGroupOne';
const storyGroupTwo = 'storyGroupTwo';
const initialText = '* replace_with_intent';
const testText = '* my_intent';

describe('stories', function() {
    before(function() {
        // cy.deleteProject('bf');
    });

    afterEach(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
    });

    it('should be able to add and delete stories', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.contains('storyGroupOne').click();
        cy.wait(200);
        cy.dataCy('story-editor').get('textarea');
        cy.dataCy('add-story').click();
        cy.dataCy('story-editor').should('have.lengthOf', 2);
        cy.dataCy('delete-story')
            .first()
            .click();
        cy.dataCy('confirm-yes').click();
        cy.dataCy('story-editor').should('have.lengthOf', 1);
        cy.wait(300);
        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
        cy.contains(storyGroupTwo).should('not.exist');
    });

    it('should autosave stories as you edit them', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupTwo}{enter}`);
        cy.contains(storyGroupOne).click();
        cy.wait(200);
        cy.dataCy('story-editor').contains(initialText);
        cy.dataCy('story-editor')
            .get('textarea')
            .type(` {selectall}{backspace}${testText}`, { force: true });
        cy.wait(300);
        cy.contains(storyGroupTwo).click({ force: true });
        cy.wait(200);
        cy.contains(storyGroupOne).click({ force: true });
        cy.wait(200);
        cy.contains(initialText).should('not.exist');
        cy.dataCy('delete-story').click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
        cy.wait(200);
        cy.contains(storyGroupTwo)
            .first()
            .click({ force: true });
        cy.dataCy('story-title').should('have.value', storyGroupTwo);
        cy.dataCy('delete-story')
            .first()
            .click({ force: true });
        cy.dataCy('confirm-yes').click({ force: true });
    });

    it('should be able to duplicate a story', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.wait(200);
        cy.dataCy('story-editor').contains(initialText);
        cy.dataCy('duplicate-story').click();
        cy.dataCy('story-editor').should('have.lengthOf', 2);
        cy.dataCy('delete-story')
            .first()
            .click();
        cy.dataCy('confirm-yes').click();
        cy.dataCy('story-editor').should('have.lengthOf', 1);
        cy.wait(200);
        cy.dataCy('delete-story')
            .first()
            .click();
        cy.dataCy('confirm-yes').click();
    });

    it('should be able to move a story', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupTwo}{enter}`);
        cy.contains(storyGroupOne).click();
        cy.dataCy('story-title').should('have.value', storyGroupOne);
        cy.dataCy('story-editor').contains(initialText);
        cy.dataCy('move-story').click();
        cy.dataCy('move-story-dropdown').click();
        cy.dataCy('move-story-dropdown')
            .get('[role=listbox]')
            .contains(storyGroupTwo)
            .click();
        cy.dataCy('confirm-yes').click();
        cy.contains(storyGroupTwo).click();
        cy.dataCy('story-title')
            .first()
            .should('have.value', storyGroupOne);
        cy.dataCy('story-editor').should('have.lengthOf', 2);
        cy.dataCy('delete-story')
            .first()
            .click();
        cy.dataCy('confirm-yes').click();
        cy.dataCy('story-editor').should('have.lengthOf', 1);
        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
    });

    it('should be able to rename a story', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupTwo}{enter}`);
        cy.contains(storyGroupOne).click();
        cy.wait(200);
        cy.dataCy('story-title').type(' {selectall}{backspace}newTitle');
        cy.contains(storyGroupTwo).click();
        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
        cy.contains(storyGroupOne).click();
        cy.wait(300);
        cy.dataCy('story-title').should('have.value', 'newTitle');
        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
    });

    it('should be able to rename storyGroups and select storyGroups, train button should be in sync with the seleted story groups', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.contains(storyGroupOne).click();
        cy.dataCy('story-editor').contains(initialText);
        cy.dataCy('story-editor')
            .get('textarea')
            .type(`{selectall}{backspace}${testText}`, { force: true });
        cy.wait(500);
        cy.contains(storyGroupOne).trigger('mouseover');
        cy.dataCy('edit-name-icon').click({ force: true });
        // Change name of a story group
        cy.get('[data-cy=edit-name] input')
            .click()
            .type('{backspace}{backspace}{backspace}{enter}');
        cy.contains('storyGroup').should('exist');
        // Initially none of the story groups are selected, therefore content in the train button should be 'Train'
        cy.contains('Train Everything');
        cy.get('.active > #not-selected').click();
        cy.get('#not-selected').click();
        // Text in the train button should change after all the stories are selected
        cy.contains('Partial Training');

        cy.contains('storyGroup').click();
        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
        cy.get('.active > #selected').click();
    });

    it('should not be able to add empty story or story group names', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type('{enter}');
        cy.dataCy('browser-item').should('not.exist');
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupTwo}{enter}`);
        cy.contains(storyGroupOne).click();
        cy.dataCy('story-title').type('{selectall}{backspace}');
        cy.contains(storyGroupTwo).click();
        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
        cy.contains(storyGroupOne).click();
        cy.dataCy('story-title').should('have.value', storyGroupOne);
        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
    });

    it('should be able to delete and add stories in intro stories', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('story-editor').get('textarea');
        cy.dataCy('add-story').click();
        cy.dataCy('story-editor').should('have.lengthOf', 2);
        cy.dataCy('delete-story')
            .first()
            .click();
        cy.dataCy('confirm-yes').click();
        cy.dataCy('story-editor').should('have.lengthOf', 1);
        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
        cy.dataCy('add-story').click();
        cy.dataCy('story-editor').should('have.lengthOf', 1);
    });
});
