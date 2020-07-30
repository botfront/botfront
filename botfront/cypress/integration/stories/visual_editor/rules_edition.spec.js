/* global cy:true */

describe('rule edition', function () {
    afterEach(function () {
        cy.deleteProject('bf');
    });

    beforeEach(function () {
        cy.createProject('bf', 'My Project', 'en');
        cy.login();
        cy.visit('/project/bf/dialogs');
        cy.createStoryGroup();
    });

    it('Should be possible to create a rule', function () {
        cy.createRuleInGroup({ storyName: 'testRule' });
        cy.dataCy('story-title-prefix').should('have.text', '>>');
        cy.dataCy('story-title').should('have.value', 'testRule');
    });

    it('Should be possible to transform a story in a rule', function () {
        cy.createStoryInGroup();
        cy.dataCy('story-title-prefix').should('have.text', '##');
        cy.dataCy('story-title-prefix').click();
        cy.dataCy('story-title-prefix').should('have.text', '>>');
    });

    it('Should be possible to transform a rule in a story', function () {
        cy.createRuleInGroup();
        cy.dataCy('story-title-prefix').should('have.text', '>>');
        cy.dataCy('story-title-prefix').click();
        cy.dataCy('confirm-modal').should('exist');
        cy.dataCy('confirm-convert').click();
        cy.dataCy('story-title-prefix').should('have.text', '##');
    });

    it('Should be possible to add an ellipsis', function () {
        cy.createRuleInGroup();
        cy.dataCy('story-title-prefix').should('have.text', '>>');
        cy.dataCy('add-ellipsis-line').click({ force: true });
        cy.dataCy('ellipsis').should('exist');
    });

    it('Should not be possible to add an ellipsis after an ellipsis', function () {
        cy.createRuleInGroup();
        cy.dataCy('story-title-prefix').should('have.text', '>>');
        cy.dataCy('add-ellipsis-line').click({ force: true });
        cy.dataCy('ellipsis').should('exist');
        cy.dataCy('add-ellipsis-line').should('not.exist');
    });
});
