/* eslint-disable no-undef */

const email = 'nluviewer@test.ia';

describe('nlu-viewer role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('nlu-viewer', email, ['nlu-viewer'], id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.deleteUser(email);
    });

    it('should not be able to change a model settings', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=settings-in-model]').click();
        cy.contains('General').click();
        cy.get('form').within(() => {
            cy.get('input[name="name"]').should('be.disabled');
            cy.get('#uniforms-0000-0002').parent().should('have.class', 'disabled');
            cy.get('input[name="description"]').should('be.disabled');
            cy.get('[data-cy=save-button]').should('be.disabled');
            cy.get('#uniforms-0000-0005').parent().should('have.class', 'disabled');
        });
        cy.contains('Pipeline').click();
        cy.get('form').within(() => {
            cy.get('#config').parent().should('have.class', 'disabled');
            cy.get('[data-cy=save-button]').should('be.disabled');
        });
    });

    it('should not be able to call nlu.update', function() {
        cy.MeteorCall('nlu.update', [
            this.bf_model_id,
            {
                name: 'New Test Model',
                language: 'en',
            },
        ]).then(err => expect(err.error).to.equal('403'));
    });

    it('should NOT show the train model button', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${this.bf_model_id}`);
        cy.get('[data-cy=train-button]').should('not.exist');
    });

    it('should not be able to call nlu.train', function() {
        cy.MeteorCall('nlu.train', [
            this.bf_model_id,
            this.bf_project_id,
            { test: 1 },
        ]).then(err => expect(err.error).to.equal('403'));
    });
});
