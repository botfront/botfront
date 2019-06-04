/* eslint-disable no-undef */
let modelId = '';

describe('NLU Models ', function() {
    beforeEach(function() {
        cy.login();
    });

    before(function() {
        cy.login();
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.get('@bf_project_id').then((id) => {
            cy.createNLUModelProgramatically(id, 'MyModel', 'aa', 'My Description')
                .then((result) => {
                    modelId = result;
                });
        });
    });

    it('should be able to create a new Model by adding a new language, to the project and then delete it', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.get('[data-cy=language-selector]').click();
        cy.get('[data-cy=language-selector] input').type('French{enter}');
        cy.get('.project-settings-menu-info').click();
        cy.contains('Save Changes').click();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.get('[data-cy=model-selector]').click();
        cy.get('[data-cy=model-selector] input').type('French{enter}');
        cy.get('.nlu-menu-settings').click();
        cy.contains('Delete').click();
        cy.get('.dowload-model-backup-button').click();
        cy.get('.delete-model-button').click();
        cy.get('.ui.page.modals .primary').click();
        cy.get('[data-cy=model-selector]').click();
        cy.get('[data-cy=model-selector] input').type('Fre');
        cy.get('[data-cy=model-selector]').contains('French').should('not.exist');
    });

    it('should NOT be able to delete the default model', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.get('.project-default-language .ui > .search').click();
        cy.get('.project-default-language input').type('English');
        cy.get('.project-default-language').contains('English').click();
        cy.get('.project-settings-menu-info').click();
        cy.contains('Save Changes').click();

        // Try to delete the default model
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.get('.nlu-menu-settings').click();
        cy.contains('Delete').click();
        cy.get('.dowload-model-backup-button').click();
        cy.get('.delete-model-button').should('be.disabled');
    });

    it('should NOT be able to call the nlu.remove for the default model', function() {
        cy.MeteorCall('nlu.remove', [
            this.bf_model_id,
            this.bf_project_id,
        ]).then((result) => {
            expect(result).equals('Model Not Deleted');
        });
    });

    it('should be able to call the nlu.remove Meteor Call for the any model (not default)', function() {
        cy.MeteorCall('nlu.remove', [
            modelId,
            this.bf_project_id,
        ]).then((result) => {
            expect(result).equals('Model Deleted');
        });
    });
});
