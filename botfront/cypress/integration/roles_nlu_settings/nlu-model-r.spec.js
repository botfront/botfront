/* eslint-disable no-undef */

const email = 'nlumodelr@test.ia';

describe('nlu-data:r role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('nlu-data:r', email, ['nlu-data:r'], id);
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
        cy.get('.nlu-menu-activity').should('exist');
        cy.get('.nlu-menu-training-data').should('exist');
        cy.get('.nlu-menu-evaluation').should('exist');
        cy.get('.nlu-menu-settings').should('exist');
        cy.get('[data-cy=train-button]').should('not.exist');
        cy.get('#playground').should('exist');
    });

    it('should NOT be able go to project settings route', function() {
        // TODO
    });

    it('should NOT be able to call nlu.insert', function() {
        // TODO
    });
});
