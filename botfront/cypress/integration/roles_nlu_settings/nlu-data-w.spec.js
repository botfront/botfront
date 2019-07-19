/* eslint-disable no-undef */

const email = 'nludataw@test.ia';
let modelIdForUI = '';
const modelNameForUI = 'myModel';
const modelNameForCall = 'deleteModel';
let modelIdForCall = '';
const dataImport = `
{ 
    "common_examples": [
        {
        "text": "Je m'appelle Matthieu",
        "intent": "chitchat.presentation",
        "entities": [{
            "start": 13,
            "end": 21,
            "value": "Matthieu",
            "entity": "name"
        }]
        }
    ],
    "entity_synonyms": [],
    "fuzzy_gazette": []
}`;

describe('nlu-data:w role permissions', function() {
    before(function() {
        cy.fixture('nlu_import.json').as('data_import');
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('nlu-data:w', email, ['nlu-data:w'], id);
        });
        cy.get('@bf_model_id').then((modelId) => {
            cy.get('@bf_project_id').then((projectId) => {
                cy.addTestActivity(modelId, projectId);
            });
        });
        cy.get('@bf_project_id').then((id) => {
            cy.createNLUModelProgramatically(id, modelNameForUI, 'fr', 'my description').then((result) => {
                modelIdForUI = result;
            });
            cy.createNLUModelProgramatically(id, modelNameForCall, 'aa', 'my description').then((result) => {
                modelIdForCall = result;
            });
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.login();
        cy.deleteNLUModelProgramatically(null, this.bf_project_id, 'fr');
        cy.deleteNLUModelProgramatically(null, this.bf_project_id, 'aa');
        cy.deleteUser(email);
        cy.logout();
    });

    it('should be able to access nlu model menu tabs, activity, training-data and evaluation', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${this.bf_model_id}`);
        cy.get('.nlu-menu-activity').should('exist');
        cy.get('.nlu-menu-training-data').should('exist');
        cy.get('.nlu-menu-evaluation').should('exist');
        cy.get('.nlu-menu-settings').should('exist');
        cy.get('[data-cy=train-button]').should('not.exist');
    });

    it('should NOT be able to add new languages', function() {
    // TODO Should not be able to add new languages
    });

    it('should render activities and playground', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${this.bf_model_id}`);
        cy.get('.nlu-menu-activity').should('exist');
        cy.get('#playground').should('exist');
        cy.get('.ReactTable').should('exist');
    });

    it('should be able to change intent, delete and access the subComponent in each row', function () {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${this.bf_model_id}`);
        cy.get('.nlu-menu-activity').click();
        cy.get('[data-cy=process-in-bulk]').should('exist');
        cy.get('[data-cy=trash]').should('exist');
        // TODO: Add test for change entity, currently cypress does not allow to select text
        cy.get('[data-cy=intent-label]').trigger('mouseover');
        cy.get('[data-cy=intent-popup]').should('exist');
        cy.get('[data-cy=intent-dropdown]').eq(0).should('not.have.class', 'disabled');
        cy.contains('Save').should('not.have.class', 'disabled');
        cy.contains('Incoming').should('exist');
        cy.contains('Populate').should('exist');
    });

    // For Training tab
    it('should render training | Chit Chat and Insert many should exist', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
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
        cy.get('input').eq(1).type('TestIntent{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.get('[data-cy=intent-label]').first().trigger('mouseover');
        cy.get('[data-cy=intent-popup]').should('exist');
        cy.get('[data-cy=intent-dropdown]').eq(0).should('not.have.class', 'disabled');
        cy.contains('Save').should('not.have.class', 'disabled');
        cy.get('[data-cy=trash]').click();
    });

    it('should be able to add, edit and delete Synonym and Gazette', function() {
        const synonymName = 'test';
        const editedValues = 'foo';
        const synonymValues = 'bar, foo';
        const getSynonymRow = (v = synonymValues) => cy.contains(v).closest('.rt-tr');

        cy.visit(`/project/${this.bf_project_id}/nlu/model/${this.bf_model_id}`);
        cy.get('.nlu-menu-training-data').click();
        cy.contains('Synonyms').click();
        cy.get('.input.entity-synonym input').type(synonymName);
        cy.get('textarea.entity-synonym-values').type(synonymValues);
        cy.contains('Add').click();
        cy.wait(200);
        getSynonymRow()
            .children()
            .first()
            .should('contain', synonymName);
        getSynonymRow()
            .children()
            .eq(1)
            .should('contain', synonymValues);
        getSynonymRow()
            .children()
            .eq(1)
            .click();
        getSynonymRow()
            .children()
            .eq(1)
            .find('textarea')
            .type(`{selectall}{del}${editedValues}`);
        cy.contains('Synonyms').click();
        getSynonymRow(editedValues)
            .find('[data-cy=trash] .viewOnHover')
            .click({ force: true });
        cy.contains(editedValues).should('not.exist');
        cy.contains('Gazette').click();
        cy.get('.input.entity-synonym input').type(synonymName);
        cy.get('textarea.entity-synonym-values').type(synonymValues);
        cy.contains('Add').click();
        cy.wait(200);
        getSynonymRow()
            .children()
            .first()
            .should('contain', synonymName);
        getSynonymRow()
            .children()
            .eq(1)
            .should('contain', synonymValues);
        getSynonymRow()
            .children()
            .eq(1)
            .click();
        getSynonymRow()
            .children()
            .eq(1)
            .find('textarea')
            .type(`{selectall}{del}${editedValues}`);
        cy.contains('Gazette').click();
        getSynonymRow(editedValues)
            .find('[data-cy=trash] .viewOnHover')
            .click({ force: true });
        cy.contains(editedValues).should('not.exist');
    });

    // For Evaluation
    it('buttons for evaluation should not be rendered', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${this.bf_model_id}`);
        cy.get('.nlu-menu-evaluation').click();
        cy.get('[data-cy=select-training-button]').should('not.exist');
        cy.get('[data-cy=start-evaluation]').should('not.exist');
    });

    it('should be able to import training data through UI', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${modelIdForUI}`);
        cy.get('.nlu-menu-settings').click();
        cy.contains('Import').click();
        cy.fixture('nlu_import.json', 'utf8').then((content) => {
            cy.get('.file-dropzone').upload(content, 'data.json');
        });
        cy.contains('Import Training Data').click();
        cy.get('.s-alert-success').should('be.visible');
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${modelIdForUI}`);
        cy.contains('Training Data').click();
        cy.contains('Statistics').click();
        cy.contains('943').siblings('.label').should('contain', 'Examples');
        cy.contains('Intents').siblings('.value').should('contain', '56');
        cy.contains('Entities').siblings('.value').should('contain', '3');
    });

    it('should be able to import training data through Meteor call', function() {
        cy.MeteorCall('nlu.import', [
            JSON.parse(dataImport),
            modelIdForCall,
            true,
        ]).then(() => {
            cy.visit(`/project/${this.bf_project_id}/nlu/model/${modelIdForCall}`);
            cy.contains('Training Data').click();
            cy.contains('Statistics').click();
            cy.contains('1').siblings('.label').should('contain', 'Examples');
            cy.contains('Intents').siblings('.value').should('contain', '1');
        });
    });
    
    it('should display import tab in settings but NOT delete tab', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${this.bf_model_id}`);
        cy.get('[data-cy=settings-in-model]').click();
        cy.contains('Import').click();
        cy.contains('Delete').should('not.exist');
    });

    it('should be able to call allowed methods', function() {
        cy.MeteorCall('activity.updateExamples', [
            [{ modelId: this.bf_model_id, _id: 'will not be added' }],
        ]).then(err => expect(err.error).not.to.equal('403'));

        cy.MeteorCall('nlu.updateExample', [
            this.bf_model_id,
            {
                entities: [],
                intent: 'Test Intent',
                text: 'An intent will not be pushed',
            },
        ]).then((err) => {
            // Should give a mongo error, not unauthorized
            expect(err.error).not.to.equal('403');
        });

        cy.MeteorCall('nlu.insertExamples', [
            this.bf_model_id,
            [],
        ]).then(err => expect(err.error).not.to.equal('403'));

        cy.MeteorCall('nlu.deleteExample', [
            this.bf_model_id,
            'whatever',
        ]).then(err => expect(err.error).not.to.equal('403'));

        cy.MeteorCall('nlu.upsertEntityGazette', [
            this.bf_model_id,
            { what: 'ever' },
        ]).then(err => expect(err.error).not.to.equal('403'));

        cy.MeteorCall('nlu.deleteEntitySynonym', [
            this.bf_model_id,
            'whatever',
        ]).then(err => expect(err.error).not.to.equal('403'));

        cy.MeteorCall('nlu.deleteEntityGazette', [
            this.bf_model_id,
            'whatever',
        ]).then(err => expect(err.error).not.to.equal('403'));

        cy.MeteorCall('nlu.upsertEntitySynonym', [
            this.bf_model_id,
            { what: 'ever' },
        ]).then(err => expect(err.error).not.to.equal('403'));

        cy.MeteorCall('activity.deleteExamples', [
            this.bf_model_id,
            ['TestActivity'],
        ]).then((result) => {
            expect(result).to.equal(1);
        });
    });

    it('should NOT be able to call forbidden methods', function() {
        cy.MeteorCall('nlu.update.general', [
            this.bf_model_id,
            {
                config:
                    'pipeline:  - name: components.botfront.language_setter.LanguageSetter  - name: tokenizer_whitespace  - name: intent_featurizer_count_vectors'
                    + '  - name: intent_classifier_tensorflow_embedding  - BILOU_flag: true    name: ner_crf    features:      - [low, title, upper]'
                    + '      - [low, bias, prefix5, prefix2, suffix5, suffix3, suffix2, upper, title, digit, pattern]'
                    + '      - [low, title, upper]  - name: components.botfront.fuzzy_gazette.FuzzyGazette  - name: ner_synonyms',
            },
        ]).then(err => expect(err.error).to.equal('403'));

        // this tests inserting and duplicating since they use the same method
        cy.MeteorCall('nlu.insert', [
            {
                evaluations: [],
                language: 'en',
                name: 'To be deleted by model:w',
                published: false,
            },
            this.bf_project_id,
        ]).then(err => expect(err.error).to.equal('403'));

        cy.MeteorCall('nlu.publish', [
            this.bf_model_id,
            this.bf_project_id,
        ]).then(err => expect(err.error).to.equal('403'));
        
        cy.MeteorCall('nlu.train', [
            this.bf_model_id,
            this.bf_project_id,
            { test: 1 },
        ]).then(err => expect(err.error).equal('403'));
    });
});
