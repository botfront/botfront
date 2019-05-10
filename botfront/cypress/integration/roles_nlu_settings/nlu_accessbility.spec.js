/* eslint-disable no-undef */

describe('role accebility tests', function() {
    before(function() {
        cy.login();
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });

    afterEach(function() {
        cy.logout();
    });

    it('Test viewer role', function() {
        cy.loginViewer();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=settings-in-model]').click();
        cy.contains('General').click();
        cy.get('fieldset').should('be.disabled');
        cy.contains('Pipeline').click();
        cy.get('fieldset').should('be.disabled');
    });

    it('Test editor role', function() {
        cy.loginEditor();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=settings-in-model]').click();
        cy.contains('General').click();
        cy.get('fieldset').should('be.disabled');
        cy.contains('Pipeline').click();
        cy.get('fieldset').should('not.be.disabled');
        cy.contains('Import').click();
    });

    it('Test admin role', function() {
        cy.loginAdmin();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=settings-in-model]').click();
        cy.contains('General').click();
        cy.get('fieldset').should('not.be.disabled');
        cy.contains('Pipeline').click();
        cy.get('fieldset').should('not.be.disabled');
        cy.contains('Import').click();
        cy.contains('Export').click();
        cy.contains('Delete').click();
    });
});
