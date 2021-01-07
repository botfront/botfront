/* global cy:true */

describe('Bot responses', function() {
    beforeEach(function() {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login());
    });
    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });
    it('should create a quick reply response using the response editor', function() {
        cy.createResponseFromResponseMenu('quickreply', 'test_A');
        cy.dataCy('bot-response-input').click().find('textarea').type('response text');

        cy.dataCy('button_title').click({ force: true });
        cy.dataCy('button_title').click({ force: true });
        cy.dataCy('enter-button-title').find('input').type('button A');
        cy.dataCy('intent-label').should('exist').click();
        cy.dataCy('intent-dropdown').find('input').type('option_A{enter}');
        cy.dataCy('save-button').click();
        cy.escapeModal();

        cy.dataCy('edit-response-0').click();
        cy.dataCy('bot-response-input').contains('response text').should('exist');
        cy.dataCy('button_A').should('exist');
    });
    it('should edit a quick reply response using the response editor', function() {
        cy.createResponseFromResponseMenu('quickreply', 'test_A');
        cy.dataCy('bot-response-input').click().find('textarea').type('response text');

        cy.dataCy('button_title').click({ force: true });
        cy.dataCy('button_title').click({ force: true });
        cy.dataCy('enter-button-title').find('input').type('button A');
        cy.dataCy('intent-label').should('exist').click();
        cy.dataCy('intent-dropdown').find('input').type('option_A{enter}');
        cy.dataCy('save-button').click();
        cy.escapeModal();

        cy.dataCy('edit-response-0').click();
        cy.dataCy('bot-response-input').click().find('textarea').clear()
            .type('updated text')
            .blur();
        cy.wait(500);

        cy.dataCy('button_A').first().click({ force: true });
        cy.dataCy('enter-button-title').find('input').clear().type('button B');
        cy.dataCy('intent-label').should('exist').click();
        cy.dataCy('intent-dropdown').find('input').type('option_B{enter}');
        cy.dataCy('save-button').click();
        cy.escapeModal();

        cy.dataCy('edit-response-0').click();
        cy.dataCy('bot-response-input').contains('updated text').should('exist');
        cy.dataCy('button_B').should('exist');
    });
    it('should create quick reply variations', function() {
        cy.createResponseFromResponseMenu('quickreply', 'test_A');

        cy.dataCy('bot-response-input').click().find('textarea')
            .type('response text deleted')
            .blur();
        cy.dataCy('button_title').click({ force: true });
        cy.dataCy('enter-button-title').find('input').type('button deleted');
        cy.dataCy('intent-label').should('exist').click();
        cy.dataCy('intent-dropdown').find('input').type('payload{enter}');
        cy.dataCy('save-button').click();

        cy.dataCy('icon-trash').click();

        cy.dataCy('bot-response-input').contains('response text deleted').should('not.exist');
        cy.dataCy('button_deleted').should('not.exist');

        cy.dataCy('bot-response-input').click().find('textarea').type('response text A');
        cy.dataCy('button_title').click({ force: true });
        cy.dataCy('button_title').click({ force: true });
        cy.dataCy('enter-button-title').find('input').type('button A');
        cy.dataCy('intent-label').should('exist').click();
        cy.dataCy('intent-dropdown').find('input').type('payload{enter}');
        cy.dataCy('save-button').click();

        cy.dataCy('add-variation').click();
        cy.dataCy('variation-container').should('have.length', 2);
        cy.dataCy('bot-response-input').last().click().find('textarea')
            .type('response text B')
            .blur();
        cy.dataCy('button_title').last().click({ force: true });
        cy.dataCy('enter-button-title').find('input').type('button B');
        cy.dataCy('intent-label').should('exist').click();
        cy.dataCy('intent-dropdown').find('input').type('payload{enter}');
        cy.dataCy('save-button').click();
        cy.escapeModal();

        cy.dataCy('edit-response-0').click();
        cy.dataCy('bot-response-input').contains('response text A').should('exist');
        cy.dataCy('button_B').should('exist');
        cy.dataCy('bot-response-input').contains('response text B').should('exist');
        cy.dataCy('button_A').should('exist');
    });

    it('should provide the correct response template in a new language', () => {
        cy.createNLUModelProgramatically('bf', '', 'fr');
        cy.visit('/project/bf/dialogue');
        cy.createStoryGroup();
        cy.createFragmentInGroup();
        cy.dataCy('single-story-editor').trigger('mouseover');
        cy.dataCy('add-bot-line').click({ force: true });
        cy.dataCy('from-qr-template').click({ force: true });
        cy.dataCy('language-selector').click().find('div').contains('French')
            .click({ force: true });
        cy.dataCy('bot-response-input').find('[data-cy=button_title]').should('exist');
    });

    it('should be able to turn a quick reply into a textWithButtons response', () => {
        cy.createNLUModelProgramatically('bf', '', 'fr');
        cy.visit('/project/bf/dialogue');
        cy.createStoryGroup();
        cy.createFragmentInGroup();
        cy.dataCy('story-title').should('have.value', 'Groupo (1)');
        cy.dataCy('from-qr-template').click({ force: true });
        cy.dataCy('bot-response-input').find('textarea').click();
        cy.dataCy('bot-response-input').find('textarea').type('purple').blur();
        cy.dataCy('edit-responses').click({ force: true });
        cy.dataCy('add-variation').click();
        cy.dataCy('response-editor').find('.utterance-container').should('have.length', 2);
        cy.setQuickReplyContent('test', 'test', 'test', 1);
        cy.setQuickReplyContent('purple', 'purple', 'purple', 0);
        cy.escapeModal();
        cy.dataCy('language-selector').click();
        cy.dataCy('language-selector').find('div').contains('French').click();
        cy.dataCy('story-title').should('have.value', 'Groupo (1)');
        cy.dataCy('edit-responses').click({ force: true });
        cy.setQuickReplyContent('french', 'french', 'french', 0);
        cy.escapeModal();
        cy.dataCy('icon-pin').click({ force: true });
        cy.dataCy('icon-pin').should('have.class', 'light-green');
        cy.dataCy('language-selector').click();
        cy.dataCy('language-selector').find('div').contains('English').click();
        cy.dataCy('story-title').should('have.value', 'Groupo (1)');
        cy.dataCy('edit-responses').click({ force: true });
        cy.dataCy('response-editor').find('.light-green').should('have.length', 4); // n*2 because there are invisible pin-icons from BotResponsesContainer
        cy.dataCy('purple').should('exist');
        cy.dataCy('test').should('exist');
        cy.dataCy('bot-response-input').first().find('textarea').should('have.text', 'purple');
        cy.dataCy('bot-response-input').last().find('textarea').should('have.text', 'test');
    });
});
