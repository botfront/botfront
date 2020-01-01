/* global cy:true */
const storyGroupOne = 'storyGroupOne';
const testText = '* my_intent OR my_intent2{enter}  - utter_test';

describe('chat side panel handling', function() {
    before(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr')
            .then(() => cy.createNLUModelProgramatically('bf', '', 'en'))
            .then(() => cy.login());
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('opens and close the chat', function() {
        cy.visit('/project/bf/stories');
        cy.get('[data-cy=open-chat]').click();
        cy.get('[data-cy=chat-pane]');
        cy.get('.widget-embedded');
        cy.get('[data-cy=close-chat]').click();
        cy.get('[data-cy=chat-pane]').should('not.exist');
    });

    it('should not crash when changing language', function() {
        cy.visit('/project/bf/dialogue/templates');
        cy.get('[data-cy=open-chat]').click();
        cy.get('[data-cy=chat-language-option]').click();
        cy.get('[data-cy=chat-language-option] .visible.menu')
            .contains('en')
            .click();
    });

    it('should display the chat without any initial payload', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('delete-story')
            .click();
        cy.dataCy('confirm-yes').click();
        cy.get('[data-cy=open-chat]').click();
        cy.get('[data-cy=chat-pane]');
        cy.get('.widget-embedded');
    });

    // For this test to pass train button should be working
    it('should be able to select initial payload', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.contains('Intro stories').click();
        cy.dataCy('add-story').click();
        cy.wait(500);
        cy.dataCy('story-editor').should('have.lengthOf', 2);
        cy.dataCy('story-editor')
            .get('textarea')
            .eq(1)
            .type(` {selectall}{backspace}${testText}`, { force: true });

        cy.dataCy('open-chat').click();
        cy.dataCy('initial-payload-select').click();

        cy.dataCy('initial-payload-select')
            .get('.visible.menu')
            .contains('my_intent2');

        cy.dataCy('initial-payload-select')
            .get('.visible.menu')
            .contains('my_intent')
            .click();

        cy.dataCy('delete-story')
            .eq(1)
            .click();
        cy.dataCy('confirm-yes').click();
    });

    it('Stories from other story groups should not be present in the initial payload', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type('{enter}');
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);

        cy.contains(storyGroupOne).click();
        cy.dataCy('story-editor')
            .get('textarea')
            .type(`{selectall}{backspace}${testText}`, { force: true });

        // Select the story group
        cy.get('.active > #not-selected').click();

        cy.dataCy('open-chat').click();
        cy.dataCy('initial-payload-select').click();
        cy.dataCy('initial-payload-select')
            .get('.visible.menu')
            .contains('my_intent')
            .should('not.exist');
    });
});
