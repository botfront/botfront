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
        cy.get('form').within(() => {
            cy.get('input[name="name"]').should('be.disabled');
            cy.get('#uniforms-0000-0002').parent().should('have.class', 'disabled');
            cy.get('input[name="description"]').should('be.disabled');
            cy.get('[data-cy=save-button]').should('be.disabled');
            cy.get('#uniforms-0000-0005').parent().should('have.class', 'disabled');
        });
        cy.contains('Pipeline').click();
        cy.get('form').within(() => {
            cy.get('#config').parent().should('have.class', 'disabled');
            cy.get('[data-cy=save-button]').should('be.disabled');
        });
    });

    it('Test editor role', function() {
        cy.loginEditor();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=settings-in-model]').click();
        cy.contains('General').click();
        cy.get('form').within(() => {
            cy.get('input[name="name"]').should('be.disabled');
            cy.get('#uniforms-0000-0002').parent().should('have.class', 'disabled');
            cy.get('input[name="description"]').should('be.disabled');
            cy.get('[data-cy=save-button]').should('be.disabled');
            cy.get('#uniforms-0000-0005').parent().should('have.class', 'disabled');
        });
        cy.contains('Pipeline').click();
        cy.get('form').within(() => {
            cy.get('#config').parent().should('not.have.class', 'disabled');
            cy.get('[data-cy=save-button]').should('not.be.disabled');
        });
    });

    it('Test admin role', function() {
        cy.loginAdmin();
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

    it('Test New Model button, should be disabled for nlu-model:w', function() {
        cy.loginEditor();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.right>:first-child button.primary').should('have.class', 'disabled');
    });

    it('Test New Model button, should be disabled for nlu-model:w', function() {
        cy.loginAdmin();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.right>:first-child button.primary').should('not.have.class', 'disabled');
    });

    it('Test New Model button, should not be disabled for nlu-model:w', function() {
        cy.loginAdmin();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.secondary').should('not.have.class', 'disabled');
    });

    it('Test Duplicate Model button, should be disabled for nlu-model:w', function() {
        cy.loginEditor();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.secondary').should('have.class', 'disabled');
    });

    it('Test Duplicate Model button, should not be disabled for nlu-model:w', function() {
        cy.loginAdmin();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.secondary').should('not.have.class', 'disabled');
    });

    it('Test online/offline button, should be disabled for non admins', function() {
        cy.loginEditor();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.right.floated').should('have.class', 'disabled');
    });

    it('Test online/offline button, should be not disabled for admins', function() {
        cy.loginAdmin();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.right.floated').should('not.have.class', 'disabled');
    });
});
