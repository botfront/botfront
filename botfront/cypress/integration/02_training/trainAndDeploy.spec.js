/* global cy Cypress:true */
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

    it('Should only show activated environemnt', function() {
        cy.visit('/admin/settings');
        cy.contains('Webhooks').click();
        cy.dataCy('DeployProject').find('input').type('http://dummy.dummy');

        cy.dataCy('save-button').eq(3).click();
        cy.visit('/project/bf/settings');
        cy.contains('Project Info').click();
        cy.dataCy('deployment-environments')
            .children()
            .contains('production')
            .click();
        cy.dataCy('save-changes').click();

        cy.visit('/project/bf/dialogue');
        cy.dataCy('train-and-deploy').click();
        cy.dataCy('train-and-deploy').should('have.text', 'Deploy to production');
    });
});
