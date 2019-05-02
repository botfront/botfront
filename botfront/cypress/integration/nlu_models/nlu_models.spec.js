/* eslint-disable no-undef */
const modelName = 'MkohIY';

describe('NLU Models ', function() {
    beforeEach(function() {
        cy.login();
    });

    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });
    
    describe('Model creation', function() {
        it('Should create model with supplied parameters', function() {
            cy.visit(`/project/${this.bf_project_id}/nlu/models`);
            cy.get('.new-model').click();
            cy.get('#uniforms-0000-0001').type(modelName);
            cy.get('#uniforms-0000-0002 > .search').click();
            cy.get('#uniforms-0000-0002 > .search').type('fre');
            cy.get('#uniforms-0000-0002')
                .contains('French')
                .click();
            cy.get('#uniforms-0000-0004').type('some description');
            // TODO add instance when tests do instances
            // Save
            cy.get('.form > .primary').click();
        });
    });

    describe('NLU Import', function() {
        it('Should import a json file with training data', function() {
            this.dropEvent = {
                dataTransfer: {
                    files: [{ path: `${Cypress.config('fixturesFolder')}/nlu_import.json` }],
                },
            };
            this.dropEvent.force = true; // https://github.com/cypress-io/cypress/issues/914
            cy.visit(`/project/${this.bf_project_id}/nlu/models`);
            cy.contains('French').click();
            cy.get(':nth-child(1) > .extra > .basic > .primary').click();
            cy.get('.nlu-menu-settings').click();
            cy.contains('Import').click();
            cy.fixture('nlu_import.json', 'utf8').then((content) => {
                cy.get('.file-dropzone').upload(content, 'data.json');
            });

            cy.contains('Import Training Data').click();
        });
    });

    describe('Model deletion', function() {
        it('Should delete the model parameters', function() {
            cy.visit(`/project/${this.bf_project_id}/nlu/models`);
            cy.contains('French').click();
            // TODO add instance when tests do instances
            // Save
            cy.get(`#model-${modelName} .open-model-button`)
                .first()
                .click();
            cy.get('.nlu-menu-settings').click();
            cy.contains('Delete').click();
            cy.get('.nlu-menu-settings').click();
            cy.get('.delete-model-button').should('be.disabled');
            cy.get('.dowload-model-backup-button').click();
            cy.get('.delete-model-button').should('be.enabled');
            cy.get('.delete-model-button').click();
            cy.get('.ui.page.modals').should('be.visible');
            cy.get('.ui.page.modals .primary').click();
            cy.url('should.be', `/project/${this.bf_project_id}/nlu/models`);
            cy.get('.s-alert-success').should('be.visible');
        });
    });
});
