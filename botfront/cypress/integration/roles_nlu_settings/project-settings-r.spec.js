/* eslint-disable no-undef */

const email = 'projectsettingsr@test.ia';

describe('project-settings:r role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('project-settings:r', email, ['project-settings:r'], id);
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
            cy.wrap(sidebar).contains('Responses').should('not.exist');
            cy.wrap(sidebar).contains('NLU').should('not.exist');
            cy.wrap(sidebar).contains('Conversations').should('not.exist');
            cy.wrap(sidebar).contains('Settings');
        });
    });
});
