/* eslint-disable no-undef */

const email = 'nlumodelw@test.ia';

describe('nlu-model:w role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.login();
        cy.createUser('nlu-model:w', email, ['nlu-model:w'], `${this.bf_project_id}`);
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
        cy.get('.right>:first-child button.primary');
    });

    it('should show DUPLICATE button', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.secondary').should('not.have.class', 'disabled');
    });
});
