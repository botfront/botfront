/* eslint-disable no-undef */

const email = 'nlumodelx@test.ia';

describe('nlu-model:x role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('nlu-model:x', email, ['nlu-model:x'], id);
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

    it('should be able to access buttons in Evaluation', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-evaluation').click();
        cy.get('[data-cy=select-training-button]').should('exist');
        cy.get('[data-cy=start-evaluation]').should('exist');
    });

    it('should NOT be able to delete a model through Meteor.call', function() {
        // First a model needs to be created which would then be deleted by nlu-model:w
        cy.MeteorCall('nlu.remove', [
            this.bf_model_id,
            this.bf_project_id,
        ])// returns error code of 403 when resolves
            .then((result) => {
                expect(result.error).to.equal('403');
            });
    });

    it('should NOT be able to delete a model through UI', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-settings').click();
        cy.contains('Delete').should('not.exist');
    });

    it('should be able to call nlu.update.general', function() {
        cy.MeteorCall('nlu.update.general', [
            this.bf_model_id,
            {
                config:
                    'pipeline:  - name: components.botfront.language_setter.LanguageSetter  - name: tokenizer_whitespace  - name: intent_featurizer_count_vectors'
                    + '  - name: intent_classifier_tensorflow_embedding  - BILOU_flag: true    name: ner_crf    features:      - [low, title, upper]'
                    + '      - [low, bias, prefix5, prefix2, suffix5, suffix3, suffix2, upper, title, digit, pattern]'
                    + '      - [low, title, upper]  - name: components.botfront.fuzzy_gazette.FuzzyGazette  - name: ner_synonyms',
            },
        ]).then(res => expect(res).to.equal(this.bf_model_id));
    });

    it('should be able to call nlu.train without having a 403', function() {
        cy.MeteorCall('nlu.train', [
            this.bf_model_id,
            this.bf_project_id,
            { test: 1 },
        ]).then(err => expect(err.error).to.not.equal('403'));
    });
});
