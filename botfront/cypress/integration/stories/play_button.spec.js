
/* global cy Cypress */

describe('Story play button', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
        cy.MeteorCall('storyGroups.insert', [
            {
                _id: 'PLAY_BUTTON',
                name: 'Test Group',
                projectId: 'bf',
            },
        ]);
        cy.MeteorCall('stories.insert', [
            {
                _id: 'TESTSTORY',
                projectId: 'bf',
                storyGroupId: 'PLAY_BUTTON',
                story: '* test_play_button\n  - utter_play_success',
                title: 'Test Story',
            },
        ]);
        cy.waitForResolve(Cypress.env('RASA_URL'));
    });

    afterEach(function() {
        cy.deleteProject('bf');
        cy.logout();
    });

    it('should open and start a new story in the chat when the play button is pressed', () => {
        cy.visit('/project/bf/stories');
        cy.train();
        cy.browseToStory('Test Story', 'Test Group');
        cy.dataCy('story-title').should('have.value', 'Test Story');
        cy.dataCy('play-story').click();
        cy.dataCy('chat-pane').find('p').contains('utter_play_success');
    });
    it('should disable the play button when a story does not start with a user utterance', () => {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Test Story', 'Test Group');
        cy.get('.story-line').should('have.length', 2);
        cy.dataCy('icon-trash').first().click({ force: true });
        cy.get('.story-line').should('have.length', 1);
        cy.dataCy('play-story').should('have.class', 'disabled').click({ force: true });
        cy.dataCy('chat-pane').should('not.exist');
    });
    it('trigger a smart story with query string entities using the play button', () => {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Test Story', 'Test Group');
        cy.get('.story-line').should('have.length', 2);
        cy.get('.utterances-container').first().findCy('icon-trash').click({ force: true });
        cy.get('.story-line').should('have.length', 1);
        // add trigger to story
        cy.dataCy('edit-trigger-rules').click();
        cy.dataCy('toggle-query-string').find('input').click({ force: true });
        cy.dataCy('toggle-query-string').find('[data-cy=toggled-true]');
        cy.dataCy('query-string-field').find('input').first().click()
            .type('2');
        cy.dataCy('query-string-field').find('[data-cy=send-as-entity-checkbox]').click();
        cy.dataCy('submit-triggers').click();
        cy.get('.dimmer').should('not.exist');
        // train and play the story
        cy.train();
        cy.browseToStory('Test Story', 'Test Group');
        cy.dataCy('play-story').click();
        cy.dataCy('chat-pane').find('p').contains('utter_play_success');
    });
});
