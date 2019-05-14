/* eslint-disable no-undef */

describe('Test for permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });

    afterEach(function() {
        cy.login();
        cy.deleteUser('testuser@test.com');
    });

    beforeEach(function() {
        cy.login();
    });

    it('Test for nlu-data:r, NLU Model -> route accessible for nlu-data:r', function() {
        cy.createUser('User', 'testuser@test.com', 'nlu-data:r', `${this.bf_project_id}`);
        cy.logout();
        cy.loginTestUser();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-activity').should('exist');
        cy.get('.nlu-menu-training-data').should('exist');
        cy.get('.nlu-menu-evaluation').should('exist');
        cy.get('[data-cy=train-button]').should('not.exist');
        cy.logout();
    });

    it('Test for nlu-meta:r, NLU Model -> route accessible for nlu-meta:r, routes should niot be accesible', function() {
        cy.createUser('User', 'testuser@test.com', 'nlu-meta:r', `${this.bf_project_id}`);
        cy.logout();
        cy.loginTestUser();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-activity').should('not.exist');
        cy.get('.nlu-menu-training-data').should('not.exist');
        cy.get('.nlu-menu-evaluation').should('not.exist');
    });
});
