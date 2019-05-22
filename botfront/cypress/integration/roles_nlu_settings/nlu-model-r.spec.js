/* eslint-disable no-undef */

const email = 'nlumodelr@test.ia';

describe('nlu-model:r role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('nlu-model:r', email, ['nlu-model:r'], id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.deleteUser(email);
    });

    it('should be able to access the right nlu model menu tabs', function () {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-activity').should('exist');
        cy.get('.nlu-menu-training-data').should('exist');
        cy.get('.nlu-menu-evaluation').should('exist');
        cy.get('.nlu-menu-settings').should('exist');
        cy.get('[data-cy=train-button]').should('not.exist');
        cy.get('#playground').should('exist');
    });

    it('should NOT show NEW MODEL button', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.get('.right>:first-child button.primary').should('not.exist');
    });

    it('should NOT show DUPLICATE button', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.secondary').should('not.exist');
    });
});
