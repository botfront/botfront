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
        cy.deleteProject('bf');
        cy.logout();
    });

    const addTextResponse = (name, content) => {
        cy.dataCy('create-response').click();
        cy.dataCy('add-text-response').click();
        cy.dataCy('response-name-input').click().find('input').type(name);
        cy.dataCy('bot-response-input').find('textarea').type(content);
        cy.wait(100);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('.dimmer').should('not.exist');
        cy.dataCy('template-intent').contains(`utter_${name}`).should('exist');
    };
    
    it('should create a response using the response editor', function() {
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('create-response').click();
        cy.dataCy('add-text-response').click();
        cy.dataCy('response-name-input').click().find('input').type('test_A');
        cy.dataCy('bot-response-input').find('textarea').type('response content');
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        cy.dataCy('remove-response-0').click();
    });
    it('should edit a response using the response editor', function() {
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('create-response').click();
        cy.dataCy('add-text-response').click();

        cy.dataCy('response-name-input').click().find('input').type('test_A');
        cy.dataCy('bot-response-input').find('textarea').type('response content');
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.dataCy('edit-response-0').click();
        cy.dataCy('response-name-input').click().find('input').type('{backspace}B');
        cy.dataCy('bot-response-input').click({ force: true }).find('textarea').clear()
            .type('new response')
            .blur();
        cy.wait(100);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('dimmer').should('not.exist');
        cy.wait(100);
        cy.dataCy('template-intent').contains('utter_test_B').should('exist');
        cy.dataCy('response-text').contains('new response').should('exist');
        cy.dataCy('template-intent').contains('utter_test_A').should('not.exist');
        cy.dataCy('response-text').contains('response content').should('not.exist');
    });
    it('should allow the response to be edited in another language', function() {
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('create-response').click();
        cy.dataCy('add-text-response').click();
        cy.dataCy('response-name-input').click().find('input').type('test_A');
        cy.dataCy('bot-response-input').find('textarea').type('response content');
        cy.wait(100);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('dimmer').should('not.exist');
        cy.wait(100);
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        // edit in a second language
        cy.get('.item').contains('German').click();
        cy.dataCy('edit-response-0').click();
        cy.dataCy('bot-response-input').click().find('textarea').clear()
            .type('new response')
            .blur();
        cy.wait(100);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('dimmer').should('not.exist');
        cy.wait(100);
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        cy.dataCy('response-text').contains('new response').should('exist');
        // verify original language has not changed
        cy.get('.item').contains('English').click();
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        cy.dataCy('response-text').contains('response content').should('exist');
    });
    it('should not allow duplicate names when creating a response', function() {
        cy.visit('/project/bf/dialogue/templates');
        // add the first response
        cy.dataCy('create-response').click();
        cy.dataCy('add-text-response').click();
        cy.dataCy('response-name-input').click().find('input').type('test_A');
        cy.dataCy('bot-response-input').find('textarea').type('response content');
        cy.wait(100);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('dimmer').should('not.exist');
        cy.wait(100);
        // add a second response with the same name
        cy.dataCy('create-response').click();
        cy.dataCy('add-text-response').click();
        cy.dataCy('response-name-input').click().find('input').type('test_A');
        cy.dataCy('bot-response-input').find('textarea').type('response two');
        cy.get('.dimmer').click({ position: 'topLeft' }); // attempt to close the response editor
        cy.dataCy('response-name-error').should('exist');
        // verify the second response was not added
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('response-text').contains('response content').should('exist');
        cy.dataCy('response-text').contains('response two').should('not.exist');
    });
    it('should not allow duplicate names when editing a response', function() {
        cy.visit('/project/bf/dialogue/templates');
        // add the first response
        cy.dataCy('create-response').click();
        cy.dataCy('add-text-response').click();
        cy.dataCy('response-name-input').click().find('input').type('test_A');
        cy.dataCy('bot-response-input').find('textarea').type('response content');
        cy.wait(100);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('dimmer').should('not.exist');
        cy.wait(100);
        // add a second response
        cy.dataCy('create-response').click();
        cy.dataCy('add-text-response').click();
        cy.dataCy('response-name-input').click().find('input').type('test_B');
        cy.dataCy('bot-response-input').find('textarea').type('response two');
        cy.wait(100);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('dimmer').should('not.exist');
        cy.wait(100);
        // edit a the second response to have the same name as the first
        cy.dataCy('edit-response-1').click();
        cy.dataCy('response-name-input').click().find('input').type('{backspace}A');
        cy.dataCy('metadata-tab').click();
        cy.wait(100);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('dimmer').should('not.exist');
        cy.wait(100);
        cy.dataCy('response-name-error').should('exist');
        cy.dataCy('response-name-input').click().find('input').type('{backspace}B');
        // verify the response name has not been duplicated
        cy.dataCy('response-text').contains('response content').should('exist');
        cy.dataCy('template-intent').contains('test_B').should('exist');
    });
    it('should require response names to start with utter_', function() {
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('create-response').click();
        cy.dataCy('add-text-response').click();
        cy.dataCy('response-name-input').click().find('input').type('{backspace}test_A');
        cy.dataCy('bot-response-input').find('textarea').type('response text');
        cy.wait(100);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('dimmer').should('not.exist');
        cy.wait(100);
        cy.dataCy('response-name-error').should('exist');
    });

    it('should disable response name input if the response is used in a story', function() {
        cy.createStoryGroup();
        cy.createStoryInGroup();
        cy.wait(250);
        cy.dataCy('toggle-md').click();
        cy.get('.ace_content').click({ force: true });
        cy.get('textarea').type('  - utter_test_A               '); // the spaces are a workaround for a bug with md saving
        cy.get('.book.icon').eq(0).click();
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('create-response').click();
        cy.dataCy('add-text-response').click();
        cy.dataCy('response-name-input').click().find('input').type('test_A');
        cy.dataCy('bot-response-input').find('textarea').type('response content');
        cy.wait(100);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('dimmer').should('not.exist');
        cy.wait(100);

        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('template-intent').parents('.rt-tr-group').find('.edit.icon').click();
        cy.dataCy('response-name-input').should('have.class', 'disabled');
    });
    
    it('should create a response using the response editor', function() {
        cy.visit('/project/bf/dialogue/templates');
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
        cy.dataCy('bot-response-input').should('have.text', 'text content A');

        cy.dataCy('response-name-input').click().find('input').clear()
            .type('utter_test_D')
            .blur();
        cy.dataCy('bot-response-input')
            .find('textarea')
            .clear()
            .type('edited content')
            .blur();
        cy.wait(100);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('.dimmer').should('not.exist');
        cy.dataCy('template-intent').should('have.length', 1);
        cy.dataCy('template-intent').contains('utter_test_A').should('not.exist');
        cy.get('.-filters').find('input').first().click()
            .clear();
        cy.dataCy('template-intent').should('have.length', 3);
        cy.dataCy('template-intent')
            .contains('utter_test_D')
            .parents('.rt-tr').find('[data-cy=response-text]')
            .should('have.text', 'edited content');
    });

    it('be able to edit a response with the response editor in the visual story editor', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type('myTest{enter}');
        cy.dataCy('story-title').should('have.value', 'myTest');
        cy.dataCy('toggle-md').click();
        cy.get('.ace_content').click({ force: true });
        cy.get('textarea').type('  - utter_test_A                 '); // the spaces are a workaround for a bug with md saving
        cy.get('.book.icon').eq(0).click();
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('create-response').click();
        cy.dataCy('add-text-response').click();
        cy.dataCy('response-name-input').click().find('input').type('test_A');
        cy.dataCy('bot-response-input').find('textarea').type('aa');
        cy.wait(100);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('dimmer').should('not.exist');
        cy.wait(100);
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');

        cy.visit('/project/bf/stories');
        cy.dataCy('browser-item').find('span').contains('myTest').click();
        cy.dataCy('story-title').should('have.value', 'myTest');
        cy.dataCy('bot-response-input').contains('aa').should('exist').trigger('mouseover');
        cy.dataCy('edit-responses').click({ force: true });
        cy.dataCy('response-editor').should('exist');

        cy.dataCy('response-editor').find('[data-cy=bot-response-input]').type('{backspace}{backspace}edited by response editor');
        cy.dataCy('response-name-input').should('have.class', 'disabled');
        cy.dataCy('metadata-tab').click();
        cy.dataCy('toggle-force-open').click();
        cy.wait(100);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('dimmer').should('not.exist');
        cy.wait(100);

        cy.dataCy('bot-response-input').contains('edited by response editor').should('exist');
        cy.dataCy('bot-response-input').type('edited by visual story');
        cy.dataCy('browser-item').contains('myTest').click();

        cy.dataCy('edit-responses').click({ force: true });
        cy.dataCy('variations-tab').click();
        cy.dataCy('response-editor').should('exist');
        cy.wait(250);
        cy.dataCy('response-editor').find('[data-cy=bot-response-input]').contains('edited by visual story');
        cy.dataCy('metadata-tab').click();
        cy.dataCy('toggle-force-open').find('[data-cy=toggled-true]').should('exist');
    });

    it('should be able to create a response in the visual editor and edit it with the response editor', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type('myTest{enter}');
        cy.dataCy('story-title').should('have.value', 'myTest');

        cy.dataCy('single-story-editor').trigger('mouseover');
        cy.dataCy('add-bot-line').click({ force: true });
        cy.dataCy('from-text-template').click({ force: true });

        cy.dataCy('bot-response-input').click().find('textarea').type('hi')
            .blur();
        cy.dataCy('single-story-editor').trigger('mouseover');
        cy.dataCy('edit-responses').click({ force: true });
        cy.get('[data-cy=response-editor] [data-cy=bot-response-input]').should('exist');
        cy.get('[data-cy=response-editor] [data-cy=bot-response-input]').should('have.text', 'hi');
        cy.dataCy('response-editor').find('[data-cy=bot-response-input]').click().find('textarea')
            .clear()
            .type('bye')
            .blur();
        cy.wait(200); // ensure that graphql calls completes
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.wait(200); // ensure that graphql calls completes
        cy.dataCy('bot-response-input').should('exist');
        cy.dataCy('bot-response-input').should('have.text', 'bye');
    });
});
