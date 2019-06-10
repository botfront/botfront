/* eslint-disable no-undef */

const modelName = 'myModel';
let modelId = '';

describe('training data import', function() {
    beforeEach(function() {
        cy.logout();
        cy.login();
    });
    
    before(function() {
        cy.login();
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.get('@bf_project_id').then((id) => {
            cy.createNLUModelProgramatically(id, modelName, 'fr', 'my description')
                .then((result) => {
                    modelId = result;
                });
        });
        cy.logout();
    });

    it('should import training data', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${modelId}`);
        cy.get('.nlu-menu-settings').click();
        cy.contains('Import').click();
        cy.fixture('nlu_import.json', 'utf8').then((content) => {
            cy.get('.file-dropzone').upload(content, 'data.json');
        });

        cy.contains('Import Training Data').click();
        cy.get('.s-alert-success').should('be.visible');
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${modelId}`);
        cy.contains('Training Data').click();
        cy.contains('Statistics').click();
        cy.contains('943').siblings('.label').should('contain', 'Examples');
        cy.contains('Intents').siblings('.value').should('contain', '56');
        cy.contains('Entities').siblings('.value').should('contain', '3');
    });

    after(function() {
        cy.logout();
        cy.login();
        cy.deleteNLUModelProgramatically(null, this.bf_project_id, 'fr');
        cy.logout();
    });
});
