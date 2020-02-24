/* eslint-disable no-undef */

const email = 'nlumodelw@test.ia';

describe('nlu-data:w role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('nlu-data:w', email, ['nlu-data:w'], id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.deleteUser(email);
    });

    /* Test on the UI are not performed because this permission does not allow user to go to the routes to actually delete the model,
       this permission is used by project-admin to delete a model. */
    it('should be able to insert and delete a model through Meteor.call', function() {
        // First a model needs to be created which would then be deleted by nlu-data:w
        cy.MeteorCall('nlu.insert', [
            {
                evaluations: [],
                language: 'aa',
                name: 'To be deleted by model:w',
                published: false,
            },
            this.bf_project_id,
        ]) // returns modelId when resolved
            .then(modelId => cy.MeteorCall('nlu.remove', [
                modelId,
                this.bf_project_id,
            ]))
            .then((result) => {
                expect(result).to.equal(1);
            });
    });
});
