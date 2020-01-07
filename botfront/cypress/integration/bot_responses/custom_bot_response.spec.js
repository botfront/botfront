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
        cy.dataCy('custom-response-editor').click().find('textarea').type('test: success');
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        cy.dataCy('edit-response-0').click();
        cy.dataCy('custom-response-editor').contains('test: success').should('exist');
    });
    it('should edit a custom response using the response editor', function() {
        cy.visit('/project/bf/dialogue/templates');
        cy.dataCy('create-response').click();
        cy.dataCy('add-custom-response').click();
        cy.dataCy('response-name-input').click().find('input').type('test_A');
        cy.dataCy('custom-response-editor').click().find('textarea').type('test: success');
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');

        cy.dataCy('edit-response-0').click();
        cy.dataCy('custom-response-editor').click().find('textarea').clear()
            .type('success: true');
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.dataCy('edit-response-0').click();
        cy.dataCy('custom-response-editor').contains('success: true').should('exist');
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
        cy.dataCy('custom-response-editor').click().find('textarea').type('test: success');
        cy.get('.dimmer').click({ position: 'topLeft' }); // close the response editor
        cy.dataCy('edit-custom-response').click();
        cy.dataCy('custom-response-editor').contains('test: success').should('exist');
    });
});
