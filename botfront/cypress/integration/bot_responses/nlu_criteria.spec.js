/* eslint-disable no-undef */

const intentNames = ['KPI', 'ROI', 'NEW_INTENT'];
const entityNames = ['ENT1', 'ENT2'];
const newEntityNames = ['NEW ENT1', 'NEW ENT2'];
const entityValues = ['VAL1', 'VAL2'];
const searchTerm = 'KPI ENT1';
const modelName = 'myModel';
const modelLang = 'fr';


describe('NLU Criteria ', function() {
    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
    });
    
    before(function() {
        cy.login();
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.get('@bf_project_id').then((id) => {
            cy.createNLUModelWithImport(id, modelName, modelLang, 'my description');
        });
    });

    describe('With existing intents/entities', function() {
        it('Should display the bot response mode', function() {
            cy.visit(`/project/${this.bf_project_id}/nlu/models`);
            // click on 'Bot responses'
            cy.get(`[href="/project/${this.bf_project_id}/dialogue/templates"] > .item`).click({ force: true });
            cy.contains('Add bot response').click();
            cy.get('.ui.toggle.checkbox').click();
            cy.get('.ui.three.steps').should('be.visible');
            cy.get('#nlu-criterium-0 .intent').should('be.visible');
            cy.get('.add-criterium-ellipsis').should('not.be.visible');

            // Add intent
            cy.get('#nlu-criterium-0 .intent').click();
            cy.get('#nlu-criterium-0 [role=listbox]')
                .contains(intentNames[0])
                .click();
            cy.get('.add-criterium-ellipsis').should('be.visible');
            cy.get('#nlu-criterium-0 #add-entity-button').should('be.visible');
            cy.get('#nlu-criterium-0 #add-entity-button').click();
            cy.contains('AND the entity').should('be.visible');
            cy.get('#nlu-criterium-0 #entity-name-dropdown-0').should('be.visible');
            cy.get('#nlu-criterium-0 #delete-entity-button-0').should('be.visible');

            // Add entity
            cy.get('#nlu-criterium-0 #entity-name-dropdown-0').click();
            cy.get('#nlu-criterium-0 #entity-name-dropdown-0 [role=listbox]')
                .contains(entityNames[0])
                .click();
            cy.get('#nlu-criterium-0 #entity-condition-0').should('be.visible');
            cy.get('#nlu-criterium-0 #entity-value-0').should('be.visible');
            cy.get('.add-criterium-ellipsis').should('not.be.visible');
            cy.get('#nlu-criterium-0 #add-entity-button-0').should('not.be.visible');
            cy.get('#nlu-criterium-0 #delete-entity-button-0').should('be.visible');
            cy.get('#nlu-criterium-0 #entity-condition-0')
                .contains('has value')
                .click();
            cy.get('#nlu-criterium-0 #entity-condition-0')
                .contains('is detected')
                .click();
            cy.get('#nlu-criterium-0 #entity-value-0').should('not.be.visible');
            cy.get('.add-criterium-ellipsis').should('be.visible');
            cy.get('#nlu-criterium-0 #add-entity-button-0').should('be.visible');
            cy.get('#nlu-criterium-0 #delete-entity-button-0').should('be.visible');

            // Add second entity
            cy.get('#nlu-criterium-0 #add-entity-button-0').click();
            cy.get('#nlu-criterium-0 #entity-name-dropdown-1').click();
            cy.get('#nlu-criterium-0 #entity-name-dropdown-1')
                .contains(entityNames[1])
                .click();
            cy.get('#nlu-criterium-0 #entity-condition-1').should('be.visible');
            cy.get('#nlu-criterium-0 #entity-value-1').should('be.visible');
            cy.get('.add-criterium-ellipsis').should('not.be.visible');
            cy.get('#nlu-criterium-0 #delete-entity-button-1').should('be.visible');
            cy.get('#nlu-criterium-0 #add-entity-button-1').should('not.be.visible');
            cy.get('#nlu-criterium-0 #entity-value-1').type(entityValues[0]);
            cy.get('.add-criterium-ellipsis').should('be.visible');
            cy.get('#nlu-criterium-0 #add-entity-button-1').should('be.visible');
            cy.get('#nlu-criterium-0 #delete-entity-button-1').should('be.visible');

            // Add second criterium
            cy.get('.add-criterium-ellipsis').click();
            cy.get('#nlu-criterium-1 .intent').click();
            cy.get('#nlu-criterium-1 [role=listbox]')
                .contains(intentNames[1])
                .click();
            cy.get('.add-criterium-ellipsis').should('be.visible');
            cy.get('#nlu-criterium-1 #add-entity-button').should('be.visible');

            // Save
            cy.contains('Save response').click();
            cy.url().should('be', `/project/${this.bf_project_id}/dialogue/templates`);
        });

        it('should delete criteria elements', function() {
            cy.visit(`/project/${this.bf_project_id}/nlu/models`);
            cy.get(`[href="/project/${this.bf_project_id}/dialogue/templates"] > .item`).click({ force: true });
            cy.get('.toggle-nlu-criteria').click();
            cy.get('.nlu-criteria-filter').type(searchTerm);
            // Open bot response
            cy.get('[data-cy=edit-response-0]').click();
            cy.get('#nlu-criterium-0 #delete-entity-button-1').should('be.visible');
            cy.get('#nlu-criterium-0 #delete-entity-button-1').click();
            cy.get('#nlu-criterium-0 #delete-entity-button-1').should('not.be.visible');
            cy.get('#nlu-criterium-0 #entity-value-1').should('not.be.visible');
            cy.get('#nlu-criterium-0 #entity-button-1').should('not.be.visible');
            cy.get('#nlu-criterium-0 #entity-name-dropdown-1').should('not.be.visible');
            cy.get('#delete-criterium-button-1').click();
            cy.get('#nlu-criterium-1').should('not.be.visible');
        });

        it('should delete bot response', function() {
            cy.visit(`/project/${this.bf_project_id}/nlu/models`);
            cy.get(`[href="/project/${this.bf_project_id}/dialogue/templates"] > .item`).click({ force: true });
            cy.get('.toggle-nlu-criteria').click();
            cy.get('.nlu-criteria-filter').type(searchTerm);
            // Delete bot response
            cy.get('[data-cy=remove-response-0]').click();
            cy.get('[data-cy=remove-response-0]').should('not.exist');
        });
    });
    describe('Creating intents/entities', function() {
        it('Should allow adding non-existing intents and entities', function() {
            cy.visit(`/project/${this.bf_project_id}/nlu/models`);
            // click on 'Bot responses'
            cy.get(`[href="/project/${this.bf_project_id}/dialogue/templates"] > .item`).click({ force: true });
            cy.contains('Add bot response').click();
            cy.get('.ui.toggle.checkbox').click();
            
            // Adding an intent
            cy.get('#nlu-criterium-0 .intent').click();
            cy.get('#nlu-criterium-0 .intent input').type(`${intentNames[2]}{enter}`);
            cy.get('#nlu-criterium-0 .intent .ui.search.dropdown > .text').should('contain', intentNames[2]);
            // Adding en entity
            cy.get('#nlu-criterium-0 #add-entity-button').click();
            cy.get('#nlu-criterium-0 #entity-name-dropdown-0').click();
            cy.get('#nlu-criterium-0 #entity-name-dropdown-0 input').type(`${newEntityNames[0]}{enter}`);
            cy.get('#nlu-criterium-0 #entity-name-dropdown-0 .ui.search.dropdown > .text').should('contain', newEntityNames[0]);
            // Setting "is detected" condition
            cy.get('#nlu-criterium-0 #entity-condition-0')
                .contains('has value')
                .click();
            cy.get('#nlu-criterium-0 #entity-condition-0')
                .contains('is detected')
                .click();
            // Adding another entity condition
            cy.get('#nlu-criterium-0 #add-entity-button-0').click();
            cy.get('#nlu-criterium-0 #entity-name-dropdown-1').click();
            cy.get('#nlu-criterium-0 #entity-name-dropdown-1 input').type(`${newEntityNames[1]}{enter}`);
            cy.get('#nlu-criterium-0 #entity-name-dropdown-1 .ui.search.dropdown > .text').should('contain', newEntityNames[1]);
            // Typing a value
            cy.get('#nlu-criterium-0 #entity-value-1').type(entityValues[1]);
            cy.get('#nlu-criterium-0 #entity-value-1').should('have.value', entityValues[1]);
            // Finishing
            cy.get('.add-criterium-ellipsis').should('be.visible');
            cy.contains('Save response').click();
            cy.url().should('be', `/project/${this.bf_project_id}/dialogue/templates`);
            cy.get('.toggle-nlu-criteria').click();
            cy.get('.nlu-criteria-filter').type(intentNames[2]);
            // Delete bot response
            cy.get('[data-cy=remove-response-0]').click();
            cy.get('[data-cy=remove-response-0]').should('not.exist');
        });
    });

    after(function() {
        cy.login();
        cy.deleteNLUModelProgramatically(null, this.bf_project_id, modelLang);
        cy.logout();
    });
});
