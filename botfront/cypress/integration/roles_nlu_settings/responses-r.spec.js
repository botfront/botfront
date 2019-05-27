/* eslint-disable no-undef */

const email = 'responsesr@test.ia';

describe('responses:r role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('responses:r', email, ['responses:r'], id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.deleteUser(email);
    });

    it('should display the right items in the sidebar', function() {
        cy.visit('/');
        cy.get('[data-cy=project-menu]').then((sidebar) => {
            cy.wrap(sidebar).contains('Responses');
            cy.wrap(sidebar).contains('NLU').should('not.exist');
            cy.wrap(sidebar).contains('Conversations').should('not.exist');
            cy.wrap(sidebar).contains('Settings').should('not.exist');
        });
    });
});
