/* global cy:true */

describe('Project Credentials', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr');
        cy.login();
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    describe('Widget settings', function() {
        it('Can be saved', function() {
            cy.visit('/project/bf/settings');
            cy.contains('Chat widget').click();
            cy.dataCy('widget-title').type('-test');
            cy.get('[data-cy=save-button]').click();
            cy.get('[data-cy=changes-saved]').should('exist');
            cy.contains('Project Info').click();
            cy.contains('Chat widget').click();
            cy.get('[data-cy=widget-title] > .ui.input > input').should('have.value', 'Botfront-test');
        });

        it('install should not have env selector with one env', function() {
            cy.visit('/project/bf/settings');
            cy.contains('Chat widget').click();
            cy.dataCy('install').click();
            cy.dataCy('envs-selector').should('not.exist');
        });

        it('install should  have env selector with more env', function() {
            cy.visit('/project/bf/settings');
            cy.get('[data-cy=deployment-environments]')
                .children().contains('production').click();
            cy.get('[data-cy=save-changes]').click();
            cy.visit('/project/bf/settings');
            cy.contains('Chat widget').click();
            cy.dataCy('install').click();
            cy.dataCy('envs-selector').should('exist');
        });
    });
});
