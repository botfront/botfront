/* eslint-disable no-undef */

const email = 'nluadmin@test.ia';

describe('nlu-admin role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('nlu-admin', email, ['nlu-admin'], id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.deleteUser(email);
    });

    it('should be able to edit a models general settings and pipeline', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=settings-in-model]').click();
        cy.contains('General').click();
        cy.get('form').within(() => {
            cy.get('input[name="name"]').should('not.be.disabled');
            cy.get('#uniforms-0000-0002').parent().should('not.have.class', 'disabled');
            cy.get('input[name="description"]').should('not.be.disabled');
            cy.get('[data-cy=save-button]').should('not.be.disabled');
            cy.get('#uniforms-0000-0005').parent().should('not.have.class', 'disabled');
        });
        cy.contains('Pipeline').click();
        cy.get('form').within(() => {
            cy.get('#config').parent().should('not.have.class', 'disabled');
            cy.get('[data-cy=save-button]').should('not.be.disabled');
        });
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
