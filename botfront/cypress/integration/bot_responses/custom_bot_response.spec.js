/* global cy:true */

describe('Bot responses', function() {
    beforeEach(function() {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en');
        cy.login();
    });

    afterEach(function() {
        cy.deleteProject('bf');
        cy.logout();
    });
    it('should create a custom response using the response editor', function() {
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('create-response').click();
        cy.dataCy('add-custom-response').click();
        cy.dataCy('response-name-input').click().find('input').type('test_A');
        cy.wait(250);
        cy.dataCy('custom-response-editor').click().find('textarea').type('{selectAll}{del}{selectAll}{del}test: success');
        cy.wait(250);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('.dimmer').should('not.exist');
        cy.wait(250);
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        cy.dataCy('edit-response-0').click();
        cy.dataCy('variation-container').contains('test: success').should('exist');
    });
    it('should edit a custom response using the response editor', function() {
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('create-response').click();
        cy.dataCy('add-custom-response').click();
        cy.dataCy('response-name-input').click().find('input').type('test_A');
        cy.wait(100);
        cy.dataCy('custom-response-editor').click().find('textarea').type('{selectAll}{del}test: success');
        cy.wait(100);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.wait(100);
        cy.get('.dimmer').should('not.exist');
        cy.wait(250);
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');

        cy.dataCy('edit-response-0').click();
        cy.dataCy('variation-container').click().find('textarea')
            .type('{selectAll}{del}success: true')
            .blur();
        cy.wait(250);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('.dimmer').should('not.exist');
        cy.wait(250);
        cy.dataCy('edit-response-0').click();
        cy.dataCy('custom-response-editor').find('.ace_line').should('have.length', 2);
        cy.dataCy('custom-response-editor').find('.ace_line').contains('success: true').should('exist');
    });
    it('should add variations for a custom response', function() {
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('create-response').click();
        cy.dataCy('add-custom-response').click();
        cy.dataCy('response-name-input').click().find('input').type('test_A');
        cy.wait(100);
        cy.dataCy('custom-response-editor').click().find('textarea').type('{selectAll}{del}doesNotExist: true');
        cy.wait(100);
        cy.dataCy('icon-trash').first().click();
        cy.dataCy('custom-response-editor').contains('doesNotExist: true').should('not.exist');
        cy.dataCy('custom-response-editor').click().find('textarea').type('{selectAll}{del}test: A');
        cy.dataCy('add-variation').click();
        cy.dataCy('custom-response-editor').should('have.length', 2);
        cy.dataCy('custom-response-editor').last().click().find('textarea')
            .type('{selectAll}{del}test: B');
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        cy.dataCy('edit-response-0').click();
        cy.dataCy('custom-response-editor').contains('test: A').should('exist');
        cy.dataCy('custom-response-editor').contains('test: B').should('exist');
    });
    it('should add a custom response in the visual story editor', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type('myTest{enter}');
        cy.dataCy('story-title').should('have.value', 'myTest');

        cy.dataCy('single-story-editor').trigger('mouseover');
        cy.dataCy('add-bot-line').click({ force: true });
        cy.dataCy('from-custom-template').click();

        cy.dataCy('edit-custom-response').click();
        cy.wait(100);
        cy.dataCy('custom-response-editor').click().find('textarea').type('{selectAll}{del}test: success')
            .blur();
        cy.wait(100);
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.get('.dimmer').should('not.exist');
        cy.wait(250);
        cy.dataCy('edit-custom-response').click();
        cy.dataCy('custom-response-editor').contains('test: success').should('exist');
    });
    it('should provide the correct response template in a new language', () => {
        cy.createNLUModelProgramatically('bf', '', 'fr');
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type('myTest{enter}');
        cy.dataCy('story-title').should('have.value', 'myTest');
        cy.dataCy('single-story-editor').trigger('mouseover');
        cy.dataCy('add-bot-line').click({ force: true });
        cy.dataCy('from-custom-template').click({ force: true });
        cy.dataCy('language-selector').click().find('div').contains('French')
            .click({ force: true });
        cy.dataCy('bot-response-input').find('[data-cy=edit-custom-response]').should('exist');
    });
});
