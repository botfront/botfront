/* eslint-disable no-undef */

describe('Test for permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });

    afterEach(function() {
        cy.logout();
    });

    beforeEach(function() {
        cy.login();
    });

    it('Test for NLU model Menu, Menu tabs accessible for nlu-data:r', function() {
        const email = 'user@test.com';
        cy.createUser('nlu-data:r', email, ['nlu-data:r'], `${this.bf_project_id}`);
        cy.logout();
        cy.loginTestUser(email);
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-activity').should('exist');
        cy.get('.nlu-menu-training-data').should('exist');
        cy.get('.nlu-menu-evaluation').should('exist');
        cy.get('.nlu-menu-settings').should('not.exist');
        cy.get('[data-cy=train-button]').should('not.exist');
        cy.get('#playground').should('exist');
        cy.logout();
        cy.login();
        cy.deleteUser(email);
    });

    it('Test for NLU model Menu, Menu tabs accessible for nlu-model:r', function() {
        const email = 'user@test.com';
        cy.createUser('nlu-model:r', email, ['nlu-data:r', 'nlu-model:r'], `${this.bf_project_id}`);
        cy.logout();
        cy.loginTestUser(email);
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-activity').should('exist');
        cy.get('.nlu-menu-training-data').should('exist');
        cy.get('.nlu-menu-evaluation').should('exist');
        cy.get('.nlu-menu-settings').should('exist');
        cy.get('[data-cy=train-button]').should('not.exist');
        cy.get('#playground').should('exist');
        cy.logout();
        cy.login();
        cy.deleteUser(email);
    });

    it('Test for NLU model Menu, Menu tabs shoiuld not be accessible for user without nlu-data:r', function() {
        const email = 'user@test.com';
        cy.createUser('nlu-meta:r', email, 'nlu-meta:r', `${this.bf_project_id}`);
        cy.logout();
        cy.loginTestUser(email);
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-activity').should('not.exist');
        cy.get('.nlu-menu-training-data').should('not.exist');
        cy.get('.nlu-menu-evaluation').should('not.exist');
        cy.get('[data-cy=train-button]').should('not.exist');
        cy.get('#playground').should('not.exist');
        cy.logout();
        cy.login();
        cy.deleteUser(email);
    });
});
