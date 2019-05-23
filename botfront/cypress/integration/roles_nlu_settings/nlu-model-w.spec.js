/* eslint-disable no-undef */

const email = 'nlumodelw@test.ia';

describe('nlu-model:w role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('nlu-model:w', email, ['nlu-model:w'], id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.deleteUser(email);
    });

    it('should show NEW MODEL button', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.get('[data-cy=new-model]').should('exist');
    });

    it('should show DUPLICATE button', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.secondary').should('exist');
    });

    it('should NOT disable online button', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.right.floated').should('not.have.class', 'disabled');
    });
});
