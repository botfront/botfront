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

    
    it('should allow copy from another language with a text response', function() {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Groupo (1)');
        cy.dataCy('add-bot-line').click({ force: true });
        cy.dataCy('from-text-template').click({ force: true });
        cy.dataCy('bot-response-input')
            .find('textarea')
            .clear()
            .type('test response');
    
        // copy in a second language
        cy.dataCy('language-selector').click();
        cy.contains('German').click();
        cy.dataCy('bot-response-input').should('not.have.text', 'test response');
        cy.dataCy('import-from-lang').click({ force: true });
        cy.dataCy('import-from-lang').contains('English').click();
        cy.dataCy('bot-response-input').should('have.text', 'test response');
    });
    it('should allow copy from another language with a image response', function() {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Groupo (1)');
        cy.dataCy('add-bot-line').click({ force: true });
        cy.dataCy('from-image-template').click({ force: true });
        cy.setImage(imageUrlA);
        

        // copy in a second language
        cy.dataCy('language-selector').click();
        cy.contains('German').click();
        cy.dataCy('bot-response-input').find('img').should('have.attr', 'src')
            .and('equal', '/images/image-temp.svg');
        cy.dataCy('import-from-lang').click({ force: true });
        cy.dataCy('import-from-lang').contains('English').click();

        cy.get('[data-cy=image-container] img').should('have.attr', 'src', imageUrlA);
    });

    it('should allow copy from another language with a button response', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('language-selector').click();
        cy.dataCy('add-bot-line').click({ force: true });
        cy.dataCy('from-qr-template').click({ force: true });
        cy.dataCy('bot-response-input')
            .find('textarea')
            .type('buttons test');
        cy.dataCy('button_title').click({ force: true });
        cy.dataCy('button_title').click({ force: true });

        cy.dataCy('enter-button-title').find('input').type('button A');
        cy.dataCy('intent-label').should('exist').click();
        cy.dataCy('intent-dropdown').find('input').type('option_A{enter}');
        cy.dataCy('save-button').click();
        

        // copy in a second language
        cy.dataCy('language-selector').click();
        cy.contains('German').click();
        cy.dataCy('bot-response-input').should('not.contain.text', 'buttons testbutton A');
        cy.dataCy('import-from-lang').click({ force: true });
        cy.dataCy('import-from-lang').contains('English').click();
        cy.dataCy('bot-response-input').should('contain.text', 'buttons testbutton A');
    });

    it('should allow copy from another language with a carousel response', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('language-selector').click();
        cy.dataCy('add-bot-line').click({ force: true });
        cy.dataCy('from-carousel-template').click({ force: true });
        cy.setImage(imageUrlA);
        cy.setTitleAndSubtitle('fancy title', 'fancy subtitle');
        cy.addButtonOrSetPayload('postback option', { payload: { intent: 'get_started' } }, 0);
        cy.addButtonOrSetPayload('web_url option', { url: 'http://yahoo.com/' }, 0);
        

        // copy in a second language
        cy.dataCy('language-selector').click();
        cy.contains('German').click();
        cy.get('.carousel-slide img').should('not.exist');
        cy.get('.carousel-slide').should('not.contain.text', 'fancy title');
        cy.get('.carousel-slide').should('not.contain.text', 'fancy subtitle');
        cy.get('.carousel-slide').should('not.contain.text', 'postback option');
        cy.get('.carousel-slide').should('not.contain.text', 'web_url option');
        cy.dataCy('import-from-lang').click({ force: true });
        cy.dataCy('import-from-lang').contains('English').click();
        cy.get('.carousel-slide img').should('have.attr', 'src')
            .and('equal', imageUrlA);
        cy.get('.carousel-slide').should('contain.text', 'fancy title');
        cy.get('.carousel-slide').should('contain.text', 'fancy subtitle');
        cy.get('.carousel-slide').should('contain.text', 'postback option');
        cy.get('.carousel-slide').should('contain.text', 'web_url option');
    });
});
