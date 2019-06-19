/* eslint-disable no-undef */

const email = 'storiesr@test.ia';

describe('stories:w permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('stories:r', email, ['stories:w', 'nlu-data:r'], id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.login();
        cy.deleteUser(email);
        cy.logout();
    });

    it('should be able add stories and then delete it', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        // Check that it actually reaches the route
        cy.get('[data-cy=add-item]').click();
        cy.get('[data-cy=add-item] input').click().type('StoryDelete{enter}');

        cy.get('[data-cy=add-story]').should('exist');
        cy.get('[data-cy=delete-story]').click({ force: true });
        cy.get('[data-cy=confirm-yes]').click({ force: true });
        cy.contains('StoryDelete').should('not.exist');
    });
});
