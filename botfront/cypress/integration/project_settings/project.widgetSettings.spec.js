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

        it('should display the installation tab with the webchat Plus channel', function() {
            cy.visit('/project/bf/settings');
            cy.contains('Credentials').click();
            cy.get('[data-cy=ace-field]')
                .click();
            cy.wait(100);
            cy.get('textarea').type('{selectAll}{del}rasa_addons.core.channels.webchat_plus.WebchatPlusInput:{enter}  session_persistence: true{enter}base_url: \'http://localhost:5005\'');
            cy.get('[data-cy=save-button]').click();
            cy.get('[data-cy=changes-saved]').should('be.visible');
            cy.contains('Chat widget').click();
            cy.dataCy('install').click();
            cy.dataCy('envs-selector').should('not.exist');
            cy.dataCy('copy-webchat-snippet');
        });
    });
});
