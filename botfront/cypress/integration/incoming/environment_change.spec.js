/* eslint-disable no-undef */

describe('environments-change', function () {
    before(function () {
        cy.deleteProject('bf');
    });

    beforeEach(function () {
        cy.removeTestConversation('dev1');
        cy.removeTestConversation('dev2');
        cy.removeTestConversation('prod');
        cy.removeTestConversation('stage');
        cy.createProject('bf', 'My Project', 'fr');
        cy.createUser('admin', 'admin@bf.com', 'project-admin', 'bf');
        cy.loginTestUser('admin@bf.com');
    });

    afterEach(function () {
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
        cy.dataCy('no-conv').should('exist');
    }

    it('dropdown menu should only list selected environments', function () {
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations').click();
        cy.dataCy('env-selector').should('not.exist');
        cy.visit('/project/bf/settings');
        cy.contains('Project Info').click();
        cy.dataCy('deployment-environments')
            .children()
            .contains('staging')
            .click();
        cy.dataCy('save-changes').click();
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations').click();
        cy.dataCy('env-selector').click();
        cy.dataCy('env-selector')
            .find('div.menu')
            .should('contain.text', 'development')
            .should('contain.text', 'staging')
            .should('not.contain.text', 'production');
    });

    it('should be possible to switch between environments even if they are empty', function () {
        cy.visit('/project/bf/settings');
        cy.contains('Project Info').click();
        cy.dataCy('deployment-environments')
            .children()
            .contains('staging')
            .click();
        cy.dataCy('deployment-environments')
            .children()
            .contains('production')
            .click();
        cy.dataCy('save-changes').click();
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations').click();
        changeEnv('production');
        checkConversationEmpty();
        changeEnv('staging');
        checkConversationEmpty();
        changeEnv('development');
        checkConversationEmpty();
    });

    it('should display the right conversations and activity by environment', function () {
        cy.addTestConversation('bf', { id: 'dev1', env: 'development', lang: 'fr' });
        cy.addTestConversation('bf', { id: 'dev2', env: 'development', lang: 'fr' });
        cy.addTestConversation('bf', { id: 'prod', env: 'production', lang: 'fr' });
        cy.addTestConversation('bf', { id: 'stage', env: 'staging', lang: 'fr' });
        cy.visit('/project/bf/settings');
        cy.contains('Project Info').click();
        cy.dataCy('deployment-environments')
            .children()
            .contains('staging')
            .click();
        cy.dataCy('deployment-environments')
            .children()
            .contains('production')
            .click();
        cy.dataCy('save-changes').click();
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations').click();

        changeEnv('production');
        cy.get('.ui.vertical.menu')
            .should('not.contain.text', 'dev1')
            .should('not.contain.text', 'dev2')
            .should('contain.text', 'prod')
            .should('not.contain.text', 'stage');
        cy.dataCy('newutterances').click();
        cy.dataCy('utterance-text')
            .should('not.contain.text', 'dev1')
            .should('not.contain.text', 'dev2')
            .should('contain.text', 'prod')
            .should('not.contain.text', 'stage');

        cy.dataCy('conversations').click();
        changeEnv('development');
        cy.get('.ui.vertical.menu')
            .should('contain.text', 'dev1')
            .should('contain.text', 'dev2')
            .should('not.contain.text', 'prod')
            .should('not.contain.text', 'stage');
        cy.dataCy('newutterances').click();
        cy.dataCy('utterance-text')
            .should('contain.text', 'dev1')
            .should('not.contain.text', 'dev2')
            .should('not.contain.text', 'prod')
            .should('not.contain.text', 'stage');

        cy.dataCy('conversations').click();
        changeEnv('staging');
        cy.get('.ui.vertical.menu')
            .should('not.contain.text', 'dev1')
            .should('not.contain.text', 'dev2')
            .should('not.contain.text', 'prod')
            .should('contain.text', 'stage');
        cy.dataCy('newutterances').click();
        cy.dataCy('utterance-text')
            .should('not.contain.text', 'dev1')
            .should('not.contain.text', 'dev2')
            .should('not.contain.text', 'prod')
            .should('contain.text', 'stage');
    });
});
