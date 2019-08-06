/* eslint-disable no-undef */
const storyGroupOne = 'storyGroupOne';
const initialText = '* replace_with_intent';
const testText = '* my_intent OR my_intent2{enter}  - utter_test';

describe('chat side panel handling', function() {
    before(function() {
        cy.createProject('bf', 'My Project', 'fr')
            .then(() => cy.createNLUModelProgramatically('bf', '', 'en'));
    });

    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
    });

    after(function() {
        cy.deleteProject('bf');
    });

    it('opens and close the chat', function() {
        cy.visit('/project/bf/stories');
        cy.get('[data-cy=open-chat]').click();
        cy.get('[data-cy=chat-pane]');
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

    // For this test to pass train button should be working
    it('should be able to select initial payload', function() {
        cy.visit('/project/bf/stories');
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
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type('{enter}');
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);

        cy.contains(storyGroupOne).click();
        cy.dataCy('story-editor').contains(initialText);
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

        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
    });

    it('Correct bot response to follow utterance input', function() {
        // Uncomment below 4 lines while testing on local developer environment
        // Adjust instance address accordingly
        // cy.visit('/project/bf/settings');
        // cy.contains('Instance').click();
        // cy.get('input').eq(1).click({ force: true }).type('{selectAll}{backspace}http://localhost:5005');
        // cy.contains('Save Changes').click();
        // Go to stories and add an intent and response
        cy.visit('/project/bf/stories');
        cy.dataCy('story-editor')
            .get('textarea')
            .focus()
            .type('\n* basics.test\n  - utter_test', { force: true });
        // Train and wait for training to finish
        cy.get('[data-cy=train-button]').click();
        cy.wait(10000);
        // Open chat and type intent
        cy.get('[data-cy=open-chat]').click();
        cy.get('input.new-message').click().type('/basics.test{enter}');
        cy.visit('/project/bf/nlu/models');
        cy.get('[data-cy=open-chat]').click();
        // Verify response
        cy.contains('utter_test');
    });
});
