/* eslint-disable no-undef */
const email = 'nludatar@test.ia';
const projectId = 'bf';
describe('nlu-data:r role permissions', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr');
        cy.createUser('nlu-viewer', email, ['nlu-viewer'], projectId);
        cy.addTestConversation(projectId);
        cy.loginTestUser(email);
    });

    afterEach(function() {
        cy.removeTestConversation();
        cy.deleteProject(projectId);
        cy.deleteUser(email);
    });

    it('should be able to access nlu model menu tabs -> activity, training-data and evaluation', function() {
        cy.visit(`/project/${projectId}/nlu/models`);
        cy.get('.nlu-menu-activity').should('exist');
        cy.get('.nlu-menu-training-data').should('exist');
        cy.get('.nlu-menu-evaluation').should('exist');
        cy.get('[data-cy=train-button]').should('not.exist');
    });

    // For the Activity tab
    it('should render activities and playground', function() {
        cy.visit(`/project/${projectId}/nlu/models`);
        cy.get('.nlu-menu-activity').should('exist');
        cy.get('#playground').should('exist');
        cy.get('.ReactTable').should('exist');
    });

    it('should not be able to change intent, validate or expand entries', function () {
        cy.visit(`/project/${projectId}/nlu/models`);
        cy.get('[data-cy=language-selector] input').type('French{enter}');
        cy.get('[data-cy=process-in-bulk]').should('not.exist');
        cy.get('[data-cy=validate-button]').should('not.exist');
        cy.get('.nlu-delete-example').should('not.exist');
        cy.get('[data-cy=intent-label]').first().trigger('mouseover');
        cy.get('[data-cy=intent-popup]').should('not.exist');
        cy.get('div.rt-td.rt-expandable').should('not.exist');
        cy.get('.nlu-menu-activity').click();
        cy.contains('Incoming').should('exist');
        cy.contains('Populate').should('not.exist');
    });

    it('should be able to reinterpet intents', function() {
        // Logs the admin
        cy.login();
        cy.visit(`/project/${projectId}/nlu/models`);
        cy.get('[data-cy=train-button]').click();
        // logs back our test user
        cy.loginTestUser(email);
        cy.visit(`/project/${projectId}/nlu/models`);
        cy.get('.nlu-menu-activity').click();
        cy.get('.rt-td.right').first().click();
        cy.get('[data-cy=re-interpret-button]').should('exist');
    });

    // For the training tab
    it('should render training tab, Statistics and API || Chit Chat and Insert many should not be present', function() {
        cy.visit(`/project/${projectId}/nlu/models`);
        cy.get('.nlu-menu-training-data').click();
        cy.contains('Statistics').should('exist');
        cy.contains('API').should('exist');
        cy.contains('Insert many').should('not.exist');
        cy.contains('Chit Chat').should('not.exist');
    });

    it('should not be able to expand rows in the Examples, delete button, add synonyms and add Gazette should not be present', function() {
        cy.visit(`/project/${projectId}/nlu/models`);
        cy.get('.nlu-menu-training-data').click();
        cy.get('div.rt-td.rt-expandable').should('not.exist');
        cy.get('.nlu-delete-example').should('not.exist');
        cy.contains('Synonyms').click();
        cy.get('[data-cy=add-entity]').should('not.exist');
        cy.get('[data-cy=add-value]').should('not.exist');
        cy.contains('Gazette').click();
        cy.get('[data-cy=add-entity]').should('not.exist');
        cy.get('[data-cy=add-value]').should('not.exist');
    });

    // For Evaluation
    it('buttons for evaluation should not be rendered', function() {
        cy.visit(`/project/${projectId}/nlu/models`);
        cy.get('.nlu-menu-evaluation').click();
        cy.get('[data-cy=select-training-button]').should('not.exist');
        cy.get('[data-cy=start-evaluation]').should('not.exist');
    });

    it('should not show the add gazette and add synonyms rows', function() {
        cy.visit(`/project/${projectId}/nlu/models`);
        cy.contains('Training Data').click();
        cy.contains('Gazette').click();
        cy.get('[data-cy=add-item-row]').should('not.exist');
        cy.contains('Synonyms').click();
        cy.get('[data-cy=add-item-row]').should('not.exist');
    });

    it('should not be able to call forbidden methods', function() {
        cy.MeteorCall('nlu.upsertEntityGazette', [
            projectId,
            { what: 'ever' },
        ]).then(err => expect(err.error).to.equal('403'));

        cy.MeteorCall('nlu.deleteEntitySynonym', [
            projectId,
            'whatever',
        ]).then(err => expect(err.error).to.equal('403'));

        cy.MeteorCall('nlu.deleteEntityGazette', [
            projectId,
            'whatever',
        ]).then(err => expect(err.error).to.equal('403'));

        cy.MeteorCall('nlu.upsertEntitySynonym', [
            projectId,
            { what: 'ever' },
        ]).then(err => expect(err.error).to.equal('403'));

        cy.MeteorCall('nlu.updateExample', [
            projectId,
            {
                entities: [],
                intent: 'Test Intent',
                text: 'An intent will not be pushed',
            },
        ]).then((err) => {
            expect(err.error).equal('403');
        });

        cy.MeteorCall('activity.updateExamples', [
            [{ modelId: projectId, _id: 'will not be added' }],
        ]).then(err => expect(err.error).to.equal('403'));

        cy.MeteorCall('nlu.insertExamples', [
            projectId,
            [],
        ]).then(err => expect(err.error).to.equal('403'));

        cy.MeteorCall('nlu.deleteExample', [
            projectId,
            'whatever',
        ]).then(err => expect(err.error).to.equal('403'));

        cy.MeteorCall('activity.deleteExamples', [
            projectId,
            ['TestActivity'],
        ]).then((err) => {
            expect(err.error).to.equal('403');
        });
    });

    it('should display a model settings (but not change them)', function() {
        cy.visit(`/project/${projectId}/nlu/models`);
        cy.get('[data-cy=settings-in-model]').click();
        cy.contains('Pipeline').click();
        cy.get('form').within(() => {
            cy.get('#config').parent().should('have.class', 'disabled');
            cy.get('[data-cy=save-button]').should('be.disabled');
        });
        cy.contains('Export').click();
        cy.contains('Export Training Data').should('not.have.class', 'disabled');
    });

    it('should not display import tab in settings', function() {
        cy.visit(`/project/${projectId}/nlu/models`);
        cy.get('[data-cy=settings-in-model]').click();
        cy.contains('Import').should('not.exist');
    });
});
