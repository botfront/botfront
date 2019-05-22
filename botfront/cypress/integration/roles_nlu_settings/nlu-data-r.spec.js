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

    it('should be able to access nlu model menu tabs, activity, training-data and evaluation', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-activity').should('exist');
        cy.get('.nlu-menu-training-data').should('exist');
        cy.get('.nlu-menu-evaluation').should('exist');
        cy.get('.nlu-menu-settings').should('not.exist');
        cy.get('[data-cy=train-button]').should('not.exist');
    });

    // For the Activity tab
    it('should render activities and playground', function() {
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
        cy.get('div.rt-td.rt-expandable').should('not.exist');
        cy.contains('New Utterances').should('exist');
        cy.contains('Populate').should('not.exist');
    });

    it('should be able to reinterpet intents', function() {
        cy.logout();
        cy.login();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=train-button]').click();
        cy.logout();
        cy.loginTestUser(email);
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.rt-td.right').first().click();
        cy.get('[data-cy=re-interpret-button]').should('exist');
    });

    // For the training tab
    it('should render training and playground, Chit Chat and Insert many should not be present', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-training-data').click();
        cy.get('#intent-bulk-insert').should('not.exist');
        cy.contains('Chit Chat').should('not.exist');
    });

    it('should not be able to expand rows in the Examples, delete button not present and should not be able to add synonyms and Gazatte', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-training-data').click();
        cy.get('#intent-bulk-insert').should('not.exist');
        cy.contains('Chit Chat').should('not.exist');
        cy.get('div.rt-td.rt-expandable').should('not.exist');
        cy.get('.nlu-delete-example').should('not.exist');
        cy.contains('Synonyms').click();
        cy.get('[data-cy=add-entity]').should('not.exist');
        cy.get('[data-cy=add-synonym]').should('not.exist');
        cy.contains('Gazette').click();
        cy.get('[data-cy=add-entity]').should('not.exist');
        cy.get('[data-cy=add-synonym]').should('not.exist');
    });

    // For Evaluation
    it('buttons for evaluation should not be rendered', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-evaluation').click();
        cy.get('[data-cy=select-training-button]').should('not.exist');
        cy.get('[data-cy=start-evaluation]').should('not.exist');
    });
});
