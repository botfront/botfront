/* eslint-disable no-undef */

describe('enable an environment', function() {
    before(function() {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'fr');
    });

    after(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
    });
    describe('Environments', function() {
        it('can be enabled', function() {
            // opens deployment tab
            cy.visit('/project/bf/settings');
            cy.contains('Deployment').click();

            // enables production environment and saves
            cy.get('[data-cy=deployment-environments]')
                .children().contains('production').click();
            cy.get('[data-cy=save-changes]').click();
            // verify production environment enabled
            cy.contains('Credentials').click();
            cy.contains('Production').should('exist');

            // disables production environment
            cy.contains('Deployment').click();
            cy.get('[data-cy=deployment-environments]')
                .children().contains('production').click();
            cy.get('[data-cy=save-changes]').click();
            // verify production environment is disabled
            cy.contains('Credentials').click();
            cy.contains('Production').should('not.exist');
        });

        it('can be edited and saved', function() {
            // enabled staging and production environments
            cy.visit('/project/bf/settings');
            cy.contains('Deployment').click();
            cy.get('[data-cy=deployment-environments]')
                .children().contains('staging').click();
            cy.get('[data-cy=deployment-environments]')
                .children().contains('production').click();
            cy.get('[data-cy=save-changes]').click();
            
            // edit credentials settings
            cy.contains('Credentials').click();
            cy.contains('Staging').click();
            cy.get('[data-cy=ace-field]')
                .click();
            cy.wait(100);
            cy.get('textarea').type('{uparrow}{rightarrow}{rightarrow}{backspace}7');
            cy.get('[data-cy=save-button]').click();


            // verify edit saved
            cy.contains('Production').click();
            cy.contains('Staging').click();
            cy.contains('7005').should('exist');

            // edit endpoint settings
            cy.contains('Endpoints').click();
            cy.contains('Staging').click();
            cy.get('[data-cy=ace-field]')
                .click();
            cy.wait(100);
            cy.get('textarea')
                .type('{uparrow}')
                .type('{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}')
                .type('{backspace}')
                .type('9');
            cy.get('[data-cy=save-button]').click();


            // verify settings saved
            cy.contains('Production').click();
            cy.contains('Staging').click();
            cy.contains('9080').should('exist');
        });
    });
});
