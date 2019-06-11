/* eslint-disable no-undef */

describe('Project Settings', function() {
    before(function() {
        cy.login();
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.get('@bf_project_id').then((id) => {
            cy.createNLUModelProgramatically(id, 'Italiano', 'de');
        });
    });

    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
    });

    describe('Project info', function() {
        it('A project can be renamed', function() {
            cy.visit(`/project/${this.bf_project_id}/settings`);
            cy.get('.project-name input').click();
            cy.get('.project-name input').type('33');
            cy.get('[data-cy=save-changes]').click();
            cy.get('.project-name input').should('have.value', 'Duedix33');

            // change tab and come back to verify info is still correct
            cy.get('.project-settings-menu-rule').click();
            cy.get('.project-settings-menu-info').click();
            cy.get('.project-name input').should('have.value', 'Duedix33');
            // Switching back
            cy.get('.project-name input').click();
            cy.get('.project-name input').type('{backspace}{backspace}');
            cy.get('.save-project-info-button').click();
            cy.get('.s-alert-success').should('be.visible');
            cy.get('.project-name input').should('have.value', 'Duedix');
        });

        it('Default language can be set', function() {
            cy.visit(`/project/${this.bf_project_id}/settings`);
            cy.get('.project-default-language .ui > .search').click();
            cy.get('.project-default-language input').type('English');
            cy.get('.project-default-language').contains('English').click();
            cy.get('.save-project-info-button').click();
            cy.get('.project-default-language > .ui > div.text').should(($div) => {
                expect($div.first()).to.contain('English');
            });

            // change tab and come back to verify info is still correct
            cy.get('.project-settings-menu-rule').click();
            cy.get('.project-settings-menu-info').click();
            cy.get('.project-default-language > .ui > div.text').should(($div) => {
                expect($div.first()).to.contain('English');
            });
        });
    });

    after(function() {
        cy.login();
        cy.deleteNLUModelProgramatically(null, this.bf_project_id, 'de');
    });
});
