/* global cy:true */

describe('Project Settings', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en');
        cy.login();
    });

    afterEach(function() {
        cy.deleteProject('bf');
        cy.logout();
    });

    describe('Project info', function() {
        it('A project can be renamed', function() {
            cy.visit('/project/bf/settings');
            cy.get('.project-name input').click();
            cy.get('.project-name input').type('33');
            cy.get('[data-cy=save-changes]').click();
            cy.get('.project-name input').should('have.value', 'My Project33');

            // change tab and come back to verify info is still correct
            cy.dataCy('project-settings-menu-credentials').click();
            cy.dataCy('project-settings-menu-info').click();
            cy.get('.project-name input').should('have.value', 'My Project33');
            // Switching back
            cy.get('.project-name input').click();
            cy.get('.project-name input').type('{backspace}{backspace}');
            cy.get('.save-project-info-button').click();
            cy.get('.s-alert-success').should('be.visible');
            cy.get('.project-name input').should('have.value', 'My Project');
        });

        it('Default language can be set', function() {
            cy.visit('/project/bf/settings');
            cy.get('.project-default-language .ui > .search').click();
            cy.get('.project-default-language input').type('English');
            cy.get('.project-default-language')
                .contains('English')
                .click({ force: true });
            cy.get('.save-project-info-button').click();
            cy.get('.project-default-language > .ui > div.text').should(($div) => {
                expect($div.first()).to.contain('English');
            });

            // change tab and come back to verify info is still correct
            cy.dataCy('project-settings-menu-credentials').click();
            cy.dataCy('project-settings-menu-info').click();
            cy.get('.project-default-language > .ui > div.text').should(($div) => {
                expect($div.first()).to.contain('English');
            });
        });
    });
});
