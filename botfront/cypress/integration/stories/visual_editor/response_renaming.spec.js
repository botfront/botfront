/* global cy:true */

describe('rename responses in the visual editor', () => {
    beforeEach(() => {
        cy.createProject('bf', 'trial', 'en').then(() => {
            cy.login();
        });
        cy.visit('project/bf/dialogue');
        cy.createStoryGroup();
        cy.createStoryInGroup();
        cy.createStoryInGroup();
        // setup md
        cy.browseToStory('Groupo (2)');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('single-story-editor').find('textarea').focus({ force: true });
        cy.dataCy('single-story-editor').find('textarea').type('- utter_test_response', { force: true });
        cy.dataCy('single-story-editor').find('textarea').blur({ force: true });
        cy.dataCy('toggle-visual').click({ force: true });
        cy.visit('project/bf/dialogue');
        cy.browseToStory('Groupo (1)');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('single-story-editor').find('textarea').focus({ force: true });
        cy.dataCy('single-story-editor').find('textarea').type('- utter_test_response{enter}- utter_exists', { force: true });
        cy.dataCy('single-story-editor').find('textarea').blur({ force: true });
        cy.dataCy('toggle-visual').click({ force: true });
        // check add responses
        cy.visit('project/bf/dialogue');
        cy.browseToStory();
        cy.dataCy('bot-response-input').should('have.length', 2);
        cy.dataCy('bot-response-input').first().find('textarea').click();
        cy.dataCy('bot-response-input').first().find('textarea').type('red')
            .blur();
        cy.dataCy('bot-response-input').last().find('textarea').click();
        cy.dataCy('bot-response-input').last().find('textarea').type('blue')
            .blur();
    });

    afterEach(() => {
        cy.deleteProject('bf');
    });

    it('should rename a bot response from the visual editor and update all stories', () => {
        cy.visit('project/bf/dialogue');
        cy.browseToStory();
        cy.dataCy('single-story-editor').trigger('mouseover');
        cy.get('.response-name.locations-link').should('exist');
        cy.dataCy('bot-response-name-input').first().find('input').click();
        cy.dataCy('bot-response-name-input').first().find('input').clear()
            .type('changed')
            .blur();
        cy.dataCy('bot-response-name-input').first().should('have.class', 'error');
        cy.dataCy('bot-response-name-input').first().find('input').clear()
            .type('utter_changed.. .')
            .blur();
        cy.dataCy('bot-response-name-input').first().should('have.class', 'error');
        cy.dataCy('bot-response-name-input').first().find('input').clear()
            .type('utter_changed/')
            .blur();
        cy.dataCy('bot-response-name-input').first().should('have.class', 'error');
        cy.browseToStory('Groupo (2)');
        cy.dataCy('single-story-editor').trigger('mouseover');
        cy.get('.response-name.locations-link').should('exist');
        cy.dataCy('bot-response-name-input').find('input').clear().type('utter_changed')
            .blur();
        cy.wait(1000);
        cy.dataCy('single-story-editor').trigger('mouseover');
        cy.get('.locations-link').should('exist');
        cy.dataCy('bot-response-name-input').find('input').clear().type('utter_exists')
            .blur();
        cy.dataCy('bot-response-name-input').should('have.class', 'error');
    });
    it('should rename a bot response from the bot response editor', () => {
        cy.visit('project/bf/dialogue');
        cy.browseToStory();
        cy.dataCy('edit-responses').first().click({ force: true });
        cy.dataCy('response-name-input').click();
        cy.dataCy('response-name-input').find('input').clear().type('changed')
            .blur();
        cy.dataCy('response-name-error').should('exist');
        cy.dataCy('response-name-input').find('input').clear().type('utter_changed')
            .blur();
        cy.dataCy('response-name-error').should('not.exist');
        cy.dataCy('response-name-input').find('input').should('have.value', 'utter_changed');
        cy.escapeModal();
        cy.dataCy('single-story-editor').trigger('mouseover');
        cy.dataCy('bot-response-name-input').find('input').should('have.value', 'utter_changed');
    });
});
