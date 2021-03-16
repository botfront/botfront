/* global cy Cypress:true */

const triggerDeployment = () => {
    cy.dataCy('train-and-deploy').click();
    cy.dataCy('train-and-deploy').should('include.text', 'Deploy to production');
    cy.dataCy('trigger-deployment').click();
    cy.dataCy('deployment-confirmation-modal').find('.ui.primary.button').contains('OK').click();
};

describe('Training and deploy', function() {
    before(function() {
        // just in case it's not deleted
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
        cy.waitForResolve(Cypress.env('RASA_URL'));
        cy.wait(1000);
        cy.request('DELETE', `${Cypress.env('RASA_URL')}/model`);
        cy.setUpGitRepo();
        cy.get('@gitRepo').then(gitRepo => cy.setTestGitSettings(gitRepo));
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
        cy.get('@gitRepo').then(gitRepo => cy.tearDownGitRepo(gitRepo));
        cy.visit('/admin/settings/webhooks');
        cy.dataCy('DeployProject').find('input').clear();
    });

    it('should train, run tests, commit, call the deployment webhook, and then fail', function() {
        cy.visit('/admin/settings');
        cy.contains('Webhooks').click();
        cy.dataCy('DeployProject').find('input').clear().type('http://localhost:8000/webhooks/deploy');

        cy.dataCy('save-button').eq(3).click();
        cy.visit('/project/bf/settings');
        cy.contains('Project Info').click();
        cy.dataCy('deployment-environments')
            .children()
            .contains('production')
            .click();
        cy.dataCy('save-changes').click();

        cy.visit('/project/bf/dialogue');

        cy.createCustomStoryGroup('bf', 'test_case_group', 'tests');
        cy.createCustomStory('bf', 'test_case_group', 'deployment_test_story', {
            type: 'test_case',
            title: 'deployment test story',
            steps: [
                { user: '/get_started', entities: [], intent: 'get_started' },
                { action: 'utter_get_started' },
                {
                    user: '/chitchat.greet',
                    entities: [],
                    intent: 'chitchat.greet',
                },
                { action: 'utter_wow' },
            ],
            language: 'en',
            success: true,
            testResults: [],
        });

        triggerDeployment();
        cy.get('.s-alert-box').should('include.text', 'Deployment failed: 1 test failed during the pre-deployment test run [500]');
    });

    it('should train, run tests, commit, call the deployment webhook, and then pass', function() {
        cy.visit('/admin/settings');
        cy.contains('Webhooks').click();
        cy.dataCy('DeployProject').find('input').clear().type('http://localhost:8000/webhooks/deploy');

        cy.dataCy('save-button').eq(3).click();
        cy.visit('/project/bf/settings');
        cy.contains('Project Info').click();
        cy.dataCy('deployment-environments')
            .children()
            .contains('production')
            .click();
        cy.dataCy('save-changes').click();

        cy.visit('/project/bf/dialogue');

        cy.createCustomStoryGroup('bf', 'test_case_group', 'tests');
        cy.createCustomStory('bf', 'test_case_group', 'deployment_test_story', {
            type: 'test_case',
            title: 'deployment test story',
            steps: [
                { user: '/get_started', entities: [], intent: 'get_started' },
                { action: 'utter_get_started' },
                {
                    user: '/chitchat.greet',
                    entities: [],
                    intent: 'chitchat.greet',
                },
                { action: 'utter_hi' },
            ],
            language: 'en',
            success: true,
            testResults: [],
        });


        triggerDeployment();
        cy.get('.s-alert-box').should('include.text', 'Your project has been deployed to the production environment');
    });
});

describe('Training and deploy', function() {
    before(function() {
        // just in case it's not deleted
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
        cy.waitForResolve(Cypress.env('RASA_URL'));
        cy.wait(1000);
        cy.request('DELETE', `${Cypress.env('RASA_URL')}/model`);
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('Should not show deploy option if deploy hook not set', function() {
        cy.visit('/admin/settings');
        cy.contains('Webhooks').click();
        cy.dataCy('DeployProject').should('have.value', '');
        cy.visit('/project/bf/dialogue');
        cy.dataCy('train-and-deploy').should('not.exist');
    });
});
