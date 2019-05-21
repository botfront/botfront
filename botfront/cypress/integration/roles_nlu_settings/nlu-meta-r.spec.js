/* eslint-disable no-undef */

const email = 'nlumetar@test.ia';

describe('nlu-meta:r role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('nlu-meta:r', email, ['nlu-meta:r'], id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.deleteUser(email);
    });

    it('should display the right tabs for this user in the nlu model menu', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-activity').should('not.exist');
        cy.get('.nlu-menu-training-data').should('not.exist');
        cy.get('.nlu-menu-evaluation').should('not.exist');
        cy.get('[data-cy=train-button]').should('not.exist');
        cy.get('#playground').should('not.exist');
    });
});
