/* eslint-disable no-undef */

const email = 'nludataw@test.ia';

describe('nlu-data:w role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('nlu-data:w', email, ['nlu-data:w'], id);
        });
        cy.get('@bf_model_id').then((modelId) => {
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

    it('should be able to access nlu model menu tabs, activity, training-data and evaluation', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${this.bf_model_id}`);
        cy.get('.nlu-menu-activity').should('exist');
        cy.get('.nlu-menu-training-data').should('exist');
        cy.get('.nlu-menu-evaluation').should('exist');
        cy.get('.nlu-menu-settings').should('exist');
        cy.get('[data-cy=train-button]').should('not.exist');
    });

    it('should render activities and playground', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${this.bf_model_id}`);
        cy.get('.nlu-menu-activity').should('exist');
        cy.get('#playground').should('exist');
        cy.get('.ReactTable').should('exist');
    });

    it('should be able to change intent, validate, delete and access the subComponent in each row', function () {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${this.bf_model_id}`);
        cy.get('[data-cy=process-in-bulk]').should('exist');
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
    });

    // For Training tab
    it('should render training and playground, Chit Chat and Insert many should exist', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-training-data').click();
        cy.contains('Insert many').should('exist');
        cy.contains('Chit Chat').should('exist');
    });

    it('should be able to edit, expand and delete intent, in Examples', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${this.bf_model_id}`);
        cy.get('.nlu-menu-training-data').click();
        // Add and intent
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('An intent');
        cy.get('[data-cy=intent-dropdown]').click();
        cy.get('input').type('TestIntent{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.get('[data-cy=intent-label]').first().trigger('mouseover');
        cy.get('[data-cy=intent-popup]').should('exist');
        cy.get('.nlu-delete-example').should('exist');
        cy.get('div.rt-td.rt-expandable').first().click();
        cy.get('[data-cy=intent-dropdown]').eq(0).should('not.have.class', 'disabled');
        cy.contains('Save').should('not.have.class', 'disabled');
    });

    it('should be able to add Synonym and Gazette', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${this.bf_model_id}`);
        cy.get('.nlu-menu-training-data').click();
        cy.contains('Synonyms').click();
        cy.get('[data-cy=add-entity]').should('exist');
        cy.get('[data-cy=add-value]').should('exist');
        cy.contains('Gazette').click();
        cy.get('[data-cy=add-entity]').should('exist');
        cy.get('[data-cy=add-value]').should('exist');
    });

    // For Evaluation
    it('buttons for evaluation should not be rendered', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${this.bf_model_id}`);
        cy.get('.nlu-menu-evaluation').click();
        cy.get('[data-cy=select-training-button]').should('not.exist');
        cy.get('[data-cy=start-evaluation]').should('not.exist');
    });

    it('should display import tab in settings', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${this.bf_model_id}`);
        cy.get('[data-cy=settings-in-model]').click();
        cy.contains('Import').click();
    });
});
