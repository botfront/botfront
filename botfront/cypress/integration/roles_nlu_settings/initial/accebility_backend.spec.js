/* eslint-disable no-undef */

describe('roles backend method tests', function() {
    before(function() {
        cy.login();
        cy.fixture('bf_project_id.txt').as('bf_project_id').then((projectId) => {
            cy.visit(`/project/${projectId}/nlu/models`);
            cy.contains('English').click();
            cy.get('.cards>:first-child button.primary').click();
            cy.url().then((url) => {
                // This gets the model id
                const id = url.split('/')[7];
                cy.writeFile('cypress/fixtures/bf_model_id.txt', id);
            });
        });
    });

    afterEach(function() {
        cy.logout();
    });

    it('Test viewer role, should not be able to call nlu.update method', function() {
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.loginViewer();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=settings-in-model]').click();
        cy.window().then(
            ({ Meteor }) => new Cypress.Promise((resolve) => {
                Meteor.call(
                    'nlu.update',
                    this.bf_model_id,
                    {
                        name: 'New Test Model',
                        language: 'en',
                    },
                    (err) => {
                        resolve(err);
                    },
                );
            }),
        ).then((err) => {
            expect(err.error).to.equal('401');
        });
    });

    it('Test editor role, should not be able to call nlu.update method', function() {
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.loginEditor();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=settings-in-model]').click();
        cy.window().then(
            ({ Meteor }) => new Cypress.Promise((resolve) => {
                Meteor.call(
                    'nlu.update',
                    this.bf_model_id,
                    {
                        name: 'New Test Model',
                        language: 'en',
                    },
                    (err) => {
                        resolve(err);
                    },
                );
            }),
        ).then((err) => {
            expect(err.error).to.equal('401');
        });
    });

    it('Test editor role, should be able to call nlu.update.pipeline method', function() {
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.loginEditor();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=settings-in-model]').click();
        cy.window().then(
            ({ Meteor }) => new Cypress.Promise((resolve) => {
                Meteor.call(
                    'nlu.update.pipeline',
                    this.bf_model_id,
                    {
                        config: 'pipeline:  - name: components.botfront.language_setter.LanguageSetter  - name: tokenizer_whitespace ',
                    },
                    (err, result) => {
                        resolve(result);
                    },
                );
            }),
        ).then((result) => {
            expect(result).to.equal(`${this.bf_model_id}`);
        });
    });
});
