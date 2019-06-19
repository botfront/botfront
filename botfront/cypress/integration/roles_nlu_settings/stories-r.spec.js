/* eslint-disable no-undef */

const email = 'storiesr@test.ia';

describe('stories:r permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('stories:r', email, ['stories:r', 'nlu-data:r'], id);
            cy.addStory(id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.login();
        cy.deleteUser(email);
        cy.removeStory();
        cy.logout();
    });

    it('should be able to stories', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        // Check that it actually reaches the route
        cy.contains('Stories');
    });

    it('should NOT be able add stories', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        cy.contains('Test Story').click();
        cy.get('[data-cy=add-item]').should('not.exist');
        cy.get('[data-cy=add-story]').should('not.exist');
        cy.get('[data-cy=delete-story]').should('not.exist');
    });
});
