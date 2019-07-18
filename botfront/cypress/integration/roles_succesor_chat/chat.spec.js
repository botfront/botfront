/* eslint-disable no-undef */
let modelId = '';
const storyGroupOne = 'storyGroupOne';
const initialText = '* replace_with_intent';
const testText = '* my_intent OR my_intent2{enter}    - utter_test';

describe('chat side panel handling', function() {
    before(function() {
        cy.login();
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.get('@bf_project_id').then((id) => {
            cy.createNLUModelProgramatically(id, 'MyModel', 'fr', 'my description')
                .then((result) => {
                    modelId = result;
                });
        });
    });

    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
    });

    after(function() {
        cy.login();
        cy.deleteNLUModelProgramatically(null, this.bf_project_id, 'fr');
        cy.removeTestConversation();
        cy.logout();
    });

    it('opens and close the chat', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${modelId}`);
        cy.get('[data-cy=open-chat]').click();
        cy.get('[data-cy=chat-pane]');
        cy.get('[data-cy=close-chat]').click();
        cy.get('[data-cy=chat-pane]').should('not.exist');
    });

    // Removed for now because now we only have have one typeless instance at the begining
    // it('should remove the core instance and the chat should display a message', function() {
    //     cy.visit(`/project/${this.bf_project_id}/settings`);

    //     cy.contains('Instances').click();
    //     cy.get('[data-cy=edit-instance]').eq(0).click();
    //     cy.get('i.delete.icon').click();
    //     cy.get('[data-cy=type-selector] input').type('nlu{enter}');
    //     cy.get('[data-cy=save-instance]').click();

    //     cy.visit(`/project/${this.bf_project_id}/nlu/model/${modelId}`);
    //     cy.get('[data-cy=open-chat]').click();
    //     cy.get('[data-cy=no-core-instance-message]');
    //     cy.get('[data-cy=settings-link]').click();
    //     cy.get('[data-cy=chat-pane]').should('not.exist');

    //     cy.contains('Instances').click();
    //     cy.get('[data-cy=edit-instance]').eq(0).click();
    //     cy.get('i.delete.icon').click();
    //     cy.get('[data-cy=type-selector] input').type('core{enter}');
    //     cy.get('[data-cy=save-instance]').click();

    //     cy.get('[data-cy=open-chat]').click();
    //     cy.get('[data-cy=no-core-instance-message]').should('not.exist');
    // });

    it('should not crash when changing language', function() {
        cy.visit(`/project/${this.bf_project_id}/dialogue/templates`);

        cy.get('[data-cy=open-chat]').click();
        cy.get('[data-cy=chat-language-option]').click();
        cy.get('[data-cy=chat-language-option] .visible.menu').contains('en').click();
    });

    // For this test to pass train button should be working
    it('should be able to select initial payload', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        cy.contains('Intro stories').click();
        cy.dataCy('add-story').click();
        cy.wait(500);
        cy.dataCy('story-editor').contains(initialText);
        cy.dataCy('story-editor')
            .get('textarea').eq(1)
            .type(` {selectall}{backspace}${testText}`, { force: true });

        cy.dataCy('train-button').click();
        cy.wait(10000);

        cy.dataCy('open-chat').click();
        cy.dataCy('initial-payload-select').click();

        cy.dataCy('initial-payload-select').get('.visible.menu').contains('my_intent2');
        cy.dataCy('initial-payload-select').get('.visible.menu').contains('my_intent').click();
        cy.contains('utter_test');

        cy.dataCy('delete-story').eq(1).click();
        cy.dataCy('confirm-yes').click();
    });

    it('Stories from other story groups should not be present in the initial payload', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input').find('input').type('{enter}');
        cy.dataCy('browser-item').should('not.exist');
        cy.dataCy('add-item-input').find('input').type(`${storyGroupOne}{enter}`);

        cy.contains(storyGroupOne).click();
        cy.dataCy('story-editor').contains(initialText);
        cy.dataCy('story-editor')
            .get('textarea')
            .type(`{selectall}{backspace}${testText}`, { force: true });

        // Select the story group
        cy.get('.active > #not-selected').click();
        // cy.dataCy('train-button').click();
        // cy.wait(10000);

        cy.dataCy('open-chat').click();
        cy.dataCy('initial-payload-select').click();
        cy.dataCy('initial-payload-select').get('.visible.menu').contains('my_intent').should('not.exist');

        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
    });
});
