/* eslint-disable no-undef */

describe('environement-change', function() {
    before(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.removeTestConversationEnv('dev1');
        cy.removeTestConversationEnv('dev2');
        cy.removeTestConversationEnv('prod');
        cy.removeTestConversationEnv('stage');
        cy.createProject('bf', 'My Project', 'fr');
        cy.createUser('admin', 'admin@bf.com', 'project-admin', 'bf');
        cy.loginTestUser('admin@bf.com');
    });

    // cy.addTestConversation('bf');
    afterEach(function() {
        cy.deleteUser('admin@bf.com');
        cy.deleteProject('bf');
    });

    function changeEnv(env) {
        cy.dataCy('env-selector').click();
        cy.dataCy('env-selector')
            .find('div.menu')
            .contains(env)
            .click();
    }

    function checkConversationEmpty() {
        cy.dataCy('conversations-browser').should(
            'contain.text',
            'No conversation to load',
        );
    }

    it('dropdown menu should only list selected environments', function() {
        cy.visit('/project/bf/dialogue/conversations/env/development/p/1/');
        cy.dataCy('env-selector')
            .find('div.menu')
            .children()
            .first()
            .should('have.text', 'development');
        cy.visit('/project/bf/dialogue/conversations/env/development/p/1/');
        cy.dataCy('env-selector')
            .find('div.menu')
            .children()
            .should('have.lengthOf', 1);
        cy.visit('/project/bf/settings');
        cy.contains('Deployment').click();
        cy.dataCy('deployment-environments')
            .children()
            .contains('staging')
            .click();
        cy.dataCy('save-changes').click();
        cy.visit('/project/bf/dialogue/conversations/env/development/p/1/');
        cy.dataCy('env-selector').click();
        cy.dataCy('env-selector')
            .find('div.menu')
            .should('contain.text', 'development')
            .should('contain.text', 'staging')
            .should('not.contain.text', 'production');
    });

    it('should be possible to switch between environments even if they are empty', function() {
        cy.visit('/project/bf/settings');
        cy.contains('Deployment').click();
        cy.dataCy('deployment-environments')
            .children()
            .contains('staging')
            .click();
        cy.dataCy('deployment-environments')
            .children()
            .contains('production')
            .click();
        cy.dataCy('save-changes').click();
        cy.visit('/project/bf/dialogue/conversations/env/development/p/1/');
        changeEnv('production');
        checkConversationEmpty();
        changeEnv('staging');
        checkConversationEmpty();
        changeEnv('development');
        checkConversationEmpty();
    });

    it('should display the right conversations by environement', function() {
        cy.addTestConversationToEnv('bf', 'dev1', null);
        cy.addTestConversationToEnv('bf', 'dev2', 'development');
        cy.addTestConversationToEnv('bf', 'prod', 'production');
        cy.addTestConversationToEnv('bf', 'stage', 'staging');
        cy.visit('/project/bf/settings');
        cy.contains('Deployment').click();
        cy.dataCy('deployment-environments')
            .children()
            .contains('staging')
            .click();
        cy.dataCy('deployment-environments')
            .children()
            .contains('production')
            .click();
        cy.dataCy('save-changes').click();
        cy.visit('/project/bf/dialogue/conversations/env/development/p/1/');
        changeEnv('production');
        cy.get('.ui.vertical.menu')
            .should('not.contain.text', 'dev1')
            .should('not.contain.text', 'dev2')
            .should('contain.text', 'prod')
            .should('not.contain.text', 'stage');
        changeEnv('development');
        cy.get('.ui.vertical.menu')
            .should('contain.text', 'dev1')
            .should('contain.text', 'dev2')
            .should('not.contain.text', 'prod')
            .should('not.contain.text', 'stage');
        changeEnv('staging');
        cy.get('.ui.vertical.menu')
            .should('not.contain.text', 'dev1')
            .should('not.contain.text', 'dev2')
            .should('not.contain.text', 'prod')
            .should('contain.text', 'stage');
    });
});
