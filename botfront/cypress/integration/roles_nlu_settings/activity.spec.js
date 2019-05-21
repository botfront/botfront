/* eslint-disable no-undef */

let emailHasPermission = '';
let emailwithoutPermission = '';

describe('Test for permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').then((modelId) => {
            cy.addTestActivity(modelId);
        });
    });


    afterEach(function() {
        cy.logout();
        cy.login();
        cy.deleteUser(emailHasPermission);
        cy.deleteUser(emailwithoutPermission);
    });

    beforeEach(function() {
        cy.login();
    });

    it('A user can only re-interpret with nlu-data:r permission', function() {
        emailHasPermission = 'nludataw@test.com';
        emailwithoutPermission = 'nlumetar@test.com';
        cy.createUser('nlu-data:r', emailHasPermission, 'nlu-data:r', `${this.bf_project_id}`);
        cy.createUser('nlu-meta:r', emailwithoutPermission, 'nlu-meta:r', `${this.bf_project_id}`);
        cy.logout();
        // For valid user
        cy.loginTestUser(emailHasPermission);
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=validate-button]').should('exist');
        cy.get('.nlu-delete-example').should('exist');
        // TODO: Add test for change entity, currently cypress does not allow to select text
        cy.get('[data-cy=intent-label]').trigger('mouseover');
        cy.get('[data-cy=intent-popup]').should('exist');
        cy.get('div.rt-td.rt-expandable').click();
        cy.get('[data-cy=example-text-editor-input]').eq(1).should('not.be.disabled');
        cy.get('[data-cy=intent-dropdown]').eq(0).should('not.have.class', 'disabled');
        cy.contains('Save').should('not.have.class', 'disabled');
        cy.contains('New Utterances').should('exist');
        cy.contains('Populate').should('exist');
        cy.logout();
        // For invalid user
        cy.loginTestUser(emailwithoutPermission);
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=validate-button]').should('not.exist');
        cy.get('.nlu-delete-example').should('not.exist');
        cy.get('[data-cy=intent-label]').trigger('mouseover');
        cy.get('[data-cy=intent-popup]').should('not.exist');
        cy.get('div.rt-td.rt-expandable').click();
        cy.get('[data-cy=example-text-editor-input]').should('be.disabled');
        cy.get('[data-cy=intent-dropdown]').should('have.class', 'disabled');
        cy.contains('Save').should('not.exist');
        cy.contains('New Utterances').should('exist');
        cy.contains('Populate').should('not.exist');
    });
});
