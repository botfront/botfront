/* global cy:true */

describe('Bot responses', function() {
    beforeEach(function() {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en');
        cy.login();
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });
    const addVariation = (text) => {
        cy.dataCy('add-variation').click({ force: true });
        cy.dataCy('metadata-tab').click();
        cy.dataCy('variations-tab').click();
        cy.dataCy('bot-response-input').last().click().find('textarea')
            .type(text);
    };
    it('should add and remove variations while creating a response', function() {
        cy.createResponseFromResponseMenu('text', 'test');
        cy.dataCy('bot-response-input').click().find('textarea').type('A');
        addVariation('B');
        addVariation('C');
        cy.dataCy('bot-response-input').contains('B').click();
        cy.dataCy('bot-response-input').contains('B')
            .clear()
            .type('D');
        cy.dataCy('bot-response-input').contains('D').should('exist');
        cy.dataCy('icon-trash').eq(1).click();
        cy.dataCy('bot-response-input').contains('A').should('exist');
        cy.dataCy('bot-response-input').contains('C').should('exist');
        cy.dataCy('bot-response-input').contains('D').should('not.exist');
        
        cy.escapeModal();
        cy.dataCy('response-text').find('div').contains('A').should('exist');
        cy.dataCy('response-text').find('div').contains('C').should('exist');
        cy.dataCy('response-text').find('div').contains('D').should('not.exist');
    });
    it('should add and remove variations while editing a response', function() {
        cy.createResponseFromResponseMenu('text', 'test');
        cy.dataCy('bot-response-input').click().find('textarea').type('test A');
        addVariation('test B');
        addVariation('test C');
        cy.escapeModal();
        cy.dataCy('edit-response-0').click();
        cy.dataCy('bot-response-input').eq(0).click().find('textarea')
            .clear()
            .type('edited A');
        cy.dataCy('bot-response-input').eq(1).click().find('textarea')
            .clear()
            .type('edited deleted');
        cy.dataCy('bot-response-input').eq(2).click().find('textarea')
            .clear()
            .type('edited B')
            .blur();
        cy.dataCy('icon-trash').eq(1).click();
        cy.dataCy('bot-response-input').contains('edited deleted').should('not.exist');
        addVariation('edited C');
        cy.escapeModal();
        cy.dataCy('response-text').find('div').contains('edited A').should('exist');
        cy.dataCy('response-text').find('div').contains('edited B').should('exist');
        cy.dataCy('response-text').find('div').contains('edited C').should('exist');
        cy.dataCy('response-text').find('div').contains('edited deleted').should('not.exist');
    });
    it('should show the first variation in the visual editor', function() {
        cy.visit('/project/bf/stories');
        cy.createStoryGroup();
        cy.createStoryInGroup();

        cy.dataCy('single-story-editor').trigger('mouseover');
        cy.dataCy('add-bot-line').click({ force: true });
        cy.dataCy('from-text-template').click({ force: true });

        cy.dataCy('bot-response-input').click().find('textarea').type('hi');
        cy.dataCy('single-story-editor').trigger('mouseover');
        cy.dataCy('edit-responses').click({ force: true });
        cy.dataCy('bot-response-input').should('include.text', 'hi');
        cy.dataCy('add-variation').click();
        cy.dataCy('bot-response-input').last().click()
            .find('textarea')
            .clear()
            .type('bye');
        cy.escapeModal();
        cy.dataCy('bot-response-input').contains('bye').should('not.exist');
    });
});
