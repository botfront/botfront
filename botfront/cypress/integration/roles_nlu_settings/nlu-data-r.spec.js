/* eslint-disable no-undef */

const email = 'nludatar@test.ia';

describe('nlu-data:r role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('nlu-data:r', email, ['nlu-data:r'], id);
        });
        cy.fixture('bf_model_id.txt').then((modelId) => {
            cy.addTestActivity(modelId);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.fixture('bf_model_id.txt').then((modelId) => {
            cy.removeTestActivity(modelId);
        });
        cy.deleteUser(email);
    });

    it('should render activities', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-activity').should('exist');
        cy.get('#playground').should('exist');
        cy.get('.ReactTable').should('exist');
    });

    it('should not be able to change intent, validate or save', function () {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=validate-button]').should('not.exist');
        cy.get('.nlu-delete-example').should('not.exist');
        cy.get('[data-cy=intent-label]').trigger('mouseover');
        cy.get('[data-cy=intent-popup]').should('not.exist');
        cy.get('div.rt-td.rt-expandable').click();
        cy.get('[data-cy=example-text-editor-input]').eq(1).should('be.disabled');
        cy.get('[data-cy=intent-dropdown]').should('have.class', 'disabled');
        cy.contains('Save').should('not.exist');
        cy.contains('New Utterances').should('exist');
        cy.contains('Populate').should('not.exist');
    });

    it('should be able to access nlu model menu tabs', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-activity').should('exist');
        cy.get('.nlu-menu-training-data').should('exist');
        cy.get('.nlu-menu-evaluation').should('exist');
        cy.get('.nlu-menu-settings').should('not.exist');
        cy.get('[data-cy=train-button]').should('not.exist');
        cy.get('#playground').should('exist');
    });

    it('should be able to reinterpet intents', function() {
        
    });
});
