/* eslint-disable no-undef */

describe('enable an environment', function() {
    before(function() {
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
        it('can enable, edit, and disable staging', function() {
            cy.visit('/project/bf/settings');
            cy.contains('Deployment').click();
            cy.get('[data-cy=deployment-environments]')
                .children().contains('staging').click();
            cy.get('[data-cy=save-changes]').click();
            cy.contains('Credentials').click();
            cy.dataCy('environment-credentials-tab')
                .contains('Staging')
                .click();
            cy.get('[data-cy=ace-field]')
                .click();
            cy.wait(100);
            cy.get('textarea').type('{uparrow}{rightarrow}{rightarrow}{backspace}7');
            cy.get('[data-cy=save-button]').click();


            // verify edit saved
            cy.visit('/project/bf/settings');
            cy.contains('Credentials').click();
            cy.dataCy('environment-credentials-tab')
                .contains('Staging')
                .click();
            // cy.contains('7005').should('exist');

            cy.contains('Endpoints').click();
            cy.dataCy('environment-endpoints-tab')
                .contains('Staging').click();
            cy.get('[data-cy=ace-field]')
                .click();
            cy.wait(100);
            cy.get('textarea')
                .type('{uparrow}')
                .type('{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}')
                .type('{backspace}')
                .type('9');
            cy.get('[data-cy=save-button]').click();

            cy.visit('/project/bf/settings');
            cy.contains('Endpoints').click();
            cy.dataCy('environment-endpoints-tab')
                .contains('Staging')
                .click();
            // cy.contains('9080').should('exist');

            cy.visit('/project/bf/settings');
            cy.contains('Deployment').click();
            cy.get('[data-cy=deployment-environments]')
                .children().contains('staging').click();
            cy.get('[data-cy=save-changes]').click();
            cy.contains('Credentials').click();
            cy.dataCy('credentials-environment-menu')
                .children()
                .contains('Staging')
                .should('not.exist');
            cy.contains('Endpoints').click();
            cy.dataCy('endpoints-environment-menu')
                .children()
                .contains('Staging')
                .should('not.exist');
        });
        it('can enable, edit, and disable production', function() {
            cy.visit('/project/bf/settings');
            cy.contains('Deployment').click();
            cy.get('[data-cy=deployment-environments]')
                .children().contains('production').click();
            cy.get('[data-cy=save-changes]').click();
            cy.contains('Credentials').click();
            cy.dataCy('environment-credentials-tab')
                .contains('Production')
                .click();
            cy.get('[data-cy=ace-field]')
                .click();
            cy.wait(100);
            cy.get('textarea').type('{uparrow}{rightarrow}{rightarrow}{backspace}7');
            cy.get('[data-cy=save-button]').click();


            // verify edit saved
            cy.visit('/project/bf/settings');
            cy.contains('Credentials').click();
            cy.dataCy('environment-credentials-tab')
                .contains('Production')
                .click();
            // cy.contains('7005').should('exist');

            cy.contains('Endpoints').click();
            cy.dataCy('environment-endpoints-tab')
                .contains('Production').click();
            cy.get('[data-cy=ace-field]')
                .click();
            cy.wait(100);
            cy.get('textarea')
                .type('{uparrow}')
                .type('{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}')
                .type('{backspace}')
                .type('9');
            cy.get('[data-cy=save-button]').click();

            cy.visit('/project/bf/settings');
            cy.contains('Endpoints').click();
            cy.dataCy('environment-endpoints-tab')
                .contains('Production')
                .click();
            // cy.contains('9080').should('exist');

            cy.visit('/project/bf/settings');
            cy.contains('Deployment').click();
            cy.get('[data-cy=deployment-environments]')
                .children().contains('production').click();
            cy.get('[data-cy=save-changes]').click();
            cy.contains('Credentials').click();
            cy.dataCy('credentials-environment-menu')
                .children()
                .contains('Production')
                .should('not.exist');
            cy.contains('Endpoints').click();
            cy.dataCy('endpoints-environment-menu')
                .children()
                .contains('Production')
                .should('not.exist');
        });
    });
});
