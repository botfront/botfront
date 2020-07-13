/* global cy:true */

describe('NLU Models ', function() {
    beforeEach(function() {
        cy.login();
    });

    before(function() {
        cy.createProject('bf', 'My Project', 'en');
    });

    after(function() {
        cy.deleteProject('bf');
    });

    it('should be able to create a new Model by adding a new language to the project and then delete it', function() {
        cy.visit('/project/bf/settings');
        cy.get('[data-cy=language-selector]').click();
        cy.get('[data-cy=language-selector] input').type('French{enter}');
        cy.dataCy('project-settings-menu-info').click();
        cy.get('[data-cy=save-changes]').click();
        cy.get('.s-alert-success').should('be.visible');
        cy.visit('/project/bf/nlu/models');
        // Instance should also be added to the model that is created.
        cy.get('[data-cy=example-text-editor-input]').should('exist');
        cy.get('[data-cy=language-selector]').click();
        cy.get('[data-cy=language-selector] input').type('French{enter}');
        cy.dataCy('nlu-menu-settings').click();
        cy.contains('Delete').click();
        cy.get('.dowload-model-backup-button').click();
        cy.get('.delete-model-button').click();
        cy.get('.ui.page.modals .primary').click();
        cy.get('[data-cy=language-selector]').click();
        cy.get('[data-cy=language-selector] input').type('Fre');
        cy.get('[data-cy=language-selector]')
            .contains('French')
            .should('not.exist');
    });

    it('should NOT be able to delete the default model', function() {
        cy.visit('/project/bf/settings');
        cy.get('[data-cy=default-langauge-selection] .ui > .search').click();
        cy.get('[data-cy=default-langauge-selection] input').type('English');
        cy.get('[data-cy=default-langauge-selection]')
            .contains('English')
            .click({ force: true });
        cy.dataCy('project-settings-menu-info').click();
        cy.get('[data-cy=default-langauge-selection]').click();

        // Try to delete the default model
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-settings').click();
        cy.contains('Delete').click();
        cy.get('.dowload-model-backup-button').click();
        cy.get('.delete-model-button').should('not.exist');
    });

    // TODO: move to unit tests

    // it('should NOT be able to call the nlu.remove for the default model', function() {
    //     cy.MeteorCall('nlu.remove', [this.bf_model_id, this.bf_project_id]).then(
    //         (result) => {
    //             expect(result.error).equals('409');
    //         },
    //     );
    // });
});
