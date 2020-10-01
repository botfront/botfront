/* global cy:true */

const imageUrlA = 'https://botfront.io/images/illustrations/conversational_design_with_botfront.png';
const imageUrlB = 'https://botfront.io/images/illustrations/botfront_rasa_easy_setup.png';

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
    it('should create a custom response using the response editor', function() {
        cy.createResponseFromResponseMenu('image', 'test_A');
        cy.setImage(imageUrlA);
        cy.escapeModal();
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        cy.dataCy('response-text').find('img').should('have.attr', 'src').and('equal', imageUrlA);
    });
    it('should add and edit image variations', function() {
        cy.createResponseFromResponseMenu('image', 'test_A');
        cy.setImage(imageUrlA);
        cy.dataCy('add-variation').click();
        cy.setImage(imageUrlB, 1);
        cy.escapeModal();
        cy.dataCy('template-intent').contains('utter_test_A').should('exist');
        cy.dataCy('response-text').find('img').first().should('have.attr', 'src')
            .and('equal', imageUrlA);
        cy.dataCy('response-text').find('img').last().should('have.attr', 'src')
            .and('equal', imageUrlB);
        
        cy.log('Edit variation');
        cy.dataCy('edit-response-0').click();
        cy.dataCy('icon-trash').first().click();
        cy.dataCy('icon-trash').first().click();
        cy.setImage(imageUrlB, 1); // the first one is outside modal :'(
        cy.escapeModal();
        cy.dataCy('response-text').find('img').first().should('have.attr', 'src')
            .and('equal', imageUrlB);
        cy.dataCy('response-text').find('img').should('have.length', 1);
    });
    it('should provide the correct response template in a new language', () => {
        cy.createNLUModelProgramatically('bf', '', 'fr');
        cy.visit('/project/bf/dialogue');
        cy.createStoryGroup();
        cy.createStoryInGroup();
        cy.dataCy('single-story-editor').trigger('mouseover');
        cy.dataCy('add-bot-line').click({ force: true });
        cy.dataCy('from-image-template').click({ force: true });
        cy.dataCy('language-selector').click().find('div').contains('French')
            .click({ force: true });
        cy.dataCy('image-container').should('exist');
    });
});
