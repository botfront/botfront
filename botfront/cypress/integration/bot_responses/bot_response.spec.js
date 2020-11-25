/* global cy:true */

describe('Bot responses', function() {
    beforeEach(function() {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en').then(
            () => cy.createNLUModelProgramatically('bf', '', 'de'),
        );
        cy.login();
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    const addTextResponse = (name, content, letFail = false) => {
        cy.createResponseFromResponseMenu('text', name);
        cy.dataCy('bot-response-input').find('textarea').type(content);
        cy.wait(100);
        cy.escapeModal(letFail);
        if (!letFail) cy.dataCy('template-intent').contains(`utter_${name}`).should('exist');
    };
    
    it('should create a response using the response editor', function() {
        addTextResponse('test_A', 'response content');
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        cy.dataCy('remove-response-0').click();
    });
    it('should edit a response using the response editor', function() {
        addTextResponse('test_A', 'response content');
        cy.dataCy('edit-response-0').click();
        cy.dataCy('response-name-input').click().find('input').type('{backspace}B');
        cy.dataCy('bot-response-input').click({ force: true }).find('textarea').clear()
            .type('new response')
            .blur();
        cy.wait(100);
        cy.escapeModal();
        cy.dataCy('template-intent').contains('utter_test_B').should('exist');
        cy.dataCy('response-text').contains('new response').should('exist');
        cy.dataCy('template-intent').contains('utter_test_A').should('not.exist');
        cy.dataCy('response-text').contains('response content').should('not.exist');
    });
    it('should allow the response to be edited in another language', function() {
        addTextResponse('test_A', 'response content');
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        // edit in a second language
        cy.get('.item').contains('German').click();
        cy.dataCy('edit-response-0').click();
        cy.dataCy('bot-response-input').click().find('textarea').clear()
            .type('new response')
            .blur();
        cy.wait(100);
        cy.escapeModal();
        cy.wait(1000);
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        cy.dataCy('response-text').contains('new response').should('exist');
        // verify original language has not changed
        cy.get('.item').contains('English').click();
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        cy.dataCy('response-text').contains('response content').should('exist');
    });
    it('should not allow duplicate names when creating a response', function() {
        // add the first response
        addTextResponse('test_A', 'response content');
        // add a second response with the same name
        addTextResponse('test_A', 'response two', true);
        cy.dataCy('response-name-error').should('exist');
        // verify the second response was not added
        cy.visit('/project/bf/responses');
        cy.dataCy('response-text').contains('response content').should('exist');
        cy.dataCy('response-text').contains('response two').should('not.exist');
    });
    it('should not allow duplicate names when editing a response', function() {
        // add the first response
        addTextResponse('test_A', 'response content');
        // add a second response
        addTextResponse('test_B', 'response two');
        // edit a the second response to have the same name as the first
        cy.dataCy('edit-response-1').click();
        cy.dataCy('response-name-input').click().find('input').type('{backspace}A');
        cy.dataCy('metadata-tab').click();
        cy.escapeModal(true);
        cy.dataCy('response-name-error').should('exist');
        cy.dataCy('response-name-input').click().find('input').type('{backspace}B');
        // verify the response name has not been duplicated
        cy.dataCy('response-text').contains('response content').should('exist');
        cy.dataCy('template-intent').contains('test_B').should('exist');
    });
    it('should require response names to start with utter_ and not contain spaces', function() {
        addTextResponse('{backspace}test_A', 'response content', true);
        cy.escapeModal(true);
        cy.dataCy('response-name-error').should('exist');
        cy.dataCy('response-name-input').click();
        cy.dataCy('response-name-input').find('input').clear().type('utter_test_A. ..');
        cy.escapeModal(true);
        cy.dataCy('response-name-error').should('exist');
        cy.dataCy('response-name-input').click();
        cy.dataCy('response-name-input').find('input').clear().type('utter_test_A/');
        cy.escapeModal(true);
        cy.dataCy('response-name-error').should('exist');
        cy.dataCy('response-name-input').find('input').clear().type('utter_test_A');
        cy.escapeModal();
    });
    
    it('should create a response using the response editor', function() {
        cy.visit('/project/bf/responses');
        addTextResponse('test_A', 'text content A');
        addTextResponse('test_CA', 'text content CA');
        addTextResponse('test_B', 'text content B');
        cy.dataCy('template-intent').should('have.length', 3);
        cy.get('.-filters').find('input').first().click()
            .type('A');
        cy.dataCy('template-intent').contains('utter_test_B').should('not.exist');
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        cy.dataCy('template-intent').contains('utter_test_CA').should('exist');
        cy.dataCy('edit-response-0').click({ force: true });

        cy.dataCy('response-name-input').find('input').should('have.value', 'utter_test_A');
        cy.dataCy('bot-response-input').should('contain.text', 'text content A');

        cy.dataCy('response-name-input').click().find('input').clear()
            .type('utter_test_D')
            .blur();
        cy.dataCy('bot-response-input')
            .find('textarea')
            .clear()
            .type('edited content')
            .blur();
        cy.wait(100);
        cy.escapeModal();
        cy.dataCy('template-intent').should('have.length', 1);
        cy.dataCy('template-intent').contains('utter_test_A').should('not.exist');
        cy.get('.-filters').find('input').first().click()
            .clear();
        cy.dataCy('template-intent').should('have.length', 3);
        cy.dataCy('template-intent')
            .contains('utter_test_D')
            .parents('.rt-tr').find('[data-cy=response-text]')
            .should('contain.text', 'edited content');
    });

    it('be able to edit a response with the response editor in the visual story editor', function() {
        cy.visit('/project/bf/dialogue');
        cy.createFragmentInGroup({ groupName: 'Example group', fragmentName: 'myTest' });
        cy.dataCy('story-title').should('have.value', 'myTest');
        cy.dataCy('toggle-yaml').click();
        cy.get('.ace_content').click({ force: true });
        cy.get('textarea').type('- action: utter_test_A')
            .blur();
        cy.wait(700);
        addTextResponse('test_A', 'aa');
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');

        cy.visit('/project/bf/dialogue');
        cy.browseToStory('myTest');
        cy.dataCy('bot-response-input').contains('aa').should('exist').trigger('mouseover');
        cy.dataCy('edit-responses').click({ force: true });
        cy.dataCy('response-editor').should('exist');

        cy.dataCy('response-editor').find('[data-cy=bot-response-input]').click();
        cy.dataCy('response-editor').find('[data-cy=bot-response-input]').find('textarea').type('{backspace}{backspace}edited by response editor')
            .blur();
        cy.dataCy('metadata-tab').click();
        cy.dataCy('toggle-force-open').click();
        cy.wait(100);
        cy.escapeModal();

        cy.dataCy('bot-response-input').should('include.text', 'edited by response editor');
        cy.dataCy('bot-response-input').type('edited by visual story');

        cy.dataCy('edit-responses').click({ force: true });
        cy.dataCy('variations-tab').click();
        cy.dataCy('response-editor').should('exist');
        cy.wait(250);
        cy.dataCy('response-editor').find('[data-cy=bot-response-input]').contains('edited by visual story');
        cy.dataCy('metadata-tab').click();
        cy.dataCy('toggle-force-open').find('[data-cy=toggled-true]').should('exist');
    });
    it('should be able to open other stories that use a response a story with that response', () => {
        cy.visit('/project/bf/responses');
        addTextResponse('utter_test', 'this is a test');

        cy.visit('/project/bf/dialogue');
        cy.createStoryGroup();
        cy.createFragmentInGroup();
        cy.createFragmentInGroup();
        cy.dataCy('story-title').should('have.value', 'Groupo (2)');
        cy.dataCy('toggle-yaml').click();
        cy.get('.ace_content').click({ force: true });
        cy.get('textarea').type('- action: utter_test')
            .blur();
        cy.browseToStory('Groupo (1)', 'Groupo');
        cy.dataCy('story-title').should('have.value', 'Groupo (1)');
        cy.get('.ace_content').click({ force: true });
        cy.get('textarea').type('- action: utter_test')
            .blur();
        cy.wait(700);
        cy.dataCy('toggle-visual').click();
        cy.get('.response-name').trigger('mouseover', { force: true });
        cy.dataCy('response-locations-count').should('include.text', '2');
        cy.dataCy('response-locations-count').click({ force: true });
        cy.get('.response-name.locations-link').should('exist');
        cy.dataCy('response-locations-count').click();
        cy.dataCy('response-locations-count').click();
        cy.dataCy('story-name-link').contains('Groupo (2)').click();
        cy.dataCy('story-title').should('have.length', 2);
        cy.dataCy('story-title').first().should('have.value', 'Groupo (2)');
        cy.dataCy('story-title').last().should('have.value', 'Groupo (1)');
    });
});
