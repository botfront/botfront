/* global cy:true */
const imageUrlA = 'https://botfront.io/images/illustrations/conversational_design_with_botfront.png';

describe('Bot responses copy between languages', function() {
    afterEach(function () {
        cy.deleteProject('bf');
    });

    beforeEach(function () {
        cy.createProject('bf', 'My Project', 'en').then(
            () => cy.createNLUModelProgramatically('bf', '', 'de'),
        );
        cy.login();
        cy.visit('/project/bf/stories');
        cy.createStoryGroup();
        cy.createStoryInGroup();
    });

    
    // it('should allow copy from another language with a text response', function() {
    //     cy.visit('/project/bf/stories');
    //     cy.browseToStory('Groupo (1)');
    //     cy.dataCy('add-bot-line').click({ force: true });
    //     cy.dataCy('from-text-template').click({ force: true });
    //     cy.dataCy('bot-response-input')
    //         .find('textarea')
    //         .clear()
    //         .type('test response');
        

    //     // copy in a second language
    //     cy.dataCy('language-selector').click();
    //     cy.contains('German').click();
    //     cy.dataCy('import-from-lang').click({ force: true });
    //     cy.dataCy('import-from-lang').contains('English').click();
    //     cy.dataCy('bot-response-input').should('have.text', 'test response');
    // });
    // it('should allow copy from another language with a image response', function() {
    //     cy.visit('/project/bf/stories');
    //     cy.browseToStory('Groupo (1)');
    //     cy.dataCy('add-bot-line').click({ force: true });
    //     cy.dataCy('from-image-template').click({ force: true });
    //     cy.setImage(imageUrlA);
        

    //     // copy in a second language
    //     cy.dataCy('language-selector').click();
    //     cy.contains('German').click();
    //     cy.dataCy('import-from-lang').click({ force: true });
    //     cy.dataCy('import-from-lang').contains('English').click();

    //     cy.get('[data-cy=image-container] img').should('have.attr', 'src', imageUrlA);
    // });

    it('should allow copy from another language with a button response', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('language-selector').click();
        cy.dataCy('add-bot-line').click({ force: true });
        cy.dataCy('from-qr-template').click({ force: true });
        cy.dataCy('bot-response-input')
            .find('textarea')
            .type('buttons test');
        

        // copy in a second language
        cy.dataCy('language-selector').click();
        cy.contains('German').click();
        cy.wait(100000);
        cy.dataCy('import-from-lang').click({ force: true });
        cy.dataCy('import-from-lang').contains('English').click();
        cy.dataCy('bot-response-input').should('have.text', 'buttons test');
    });

    // it('should allow copy from another language with a carousel response', function() {
    //     addTextResponse('test_A', 'response content');
    //     cy.dataCy('template-intent').contains('utter_test_A').should('exist');
    //     // edit in a second language
    //     cy.get('.item').contains('German').click();
    //     cy.dataCy('edit-response-0').click();
    //     cy.dataCy('bot-response-input').click().find('textarea').clear()
    //         .type('new response')
    //         .blur();
    //     cy.wait(100);
    //     cy.escapeModal();
    //     cy.wait(1000);
    //     cy.dataCy('template-intent').contains('utter_test_A').should('exist');
    //     cy.dataCy('response-text').contains('new response').should('exist');
    //     // verify original language has not changed
    //     cy.get('.item').contains('English').click();
    //     cy.dataCy('template-intent').contains('utter_test_A').should('exist');
    //     cy.dataCy('response-text').contains('response content').should('exist');
    // });
});
