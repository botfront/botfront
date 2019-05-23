/* eslint-disable no-undef */

const email = 'nlumodelx@test.ia';

describe('nlu-model:x role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('nlu-model:x', email, ['nlu-model:x'], id);
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

    it('should be able to access buttons in Evaluation', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-evaluation').click();
        cy.get('[data-cy=select-training-button]').should('exist');
        cy.get('[data-cy=start-evaluation]').should('exist');
    });

    it('should NOT be able to delete a model through Meteor.call', function() {
        // First a model needs to be created which would then be deleted by nlu-model:w
        cy.MeteorCall('nlu.remove', [
            this.bf_model_id,
            this.bf_project_id,
        ])// returns error code of 403 when resolves
            .then((result) => {
                expect(result.error).to.equal('403');
            });
    });

    it('should NOT be able to delete a model through UI', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-settings').click();
        cy.contains('Delete').should('not.exist');
    });
});
