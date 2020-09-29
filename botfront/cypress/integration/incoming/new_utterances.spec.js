/* global cy Cypress:true */
describe('incoming page', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
            cy.waitForResolve(Cypress.env('RASA_URL'));
            cy.importNluData('bf', 'nlu_sample_en.json', 'en');
            cy.train();
            cy.addNewUtterances(['apple', 'kiwi', 'banana']);
        });
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('should assign populated data to the right language', function() {
        cy.addNewProjectLanguage('French');
        cy.importNluData('bf', 'nlu_sample_fr.json', 'fr');
        cy.train();

        cy.visit('/project/bf/incoming');
        cy.get('.row').should('have.length', 3);
        cy.get('.row').contains('apple').should('exist');
        cy.addNewUtterances(['pomme', 'kiwi', 'banane'], 'French');
        cy.get('.row').should('have.length', 3);
        cy.get('.row').contains('apple').should('not.exist');
        cy.get('.row').contains('pomme').should('exist');
    });

    it('should be able to link to evaluation from new utterances', function() {
        cy.dataCy('run-evaluation').should('have.class', 'disabled');
        cy.get('.row').should('have.length', 3);
        cy.selectOrUnselectIncomingRow('banana');
        cy.toggleValidationOfSelectedUtterances();
        cy.dataCy('run-evaluation').should('not.have.class', 'disabled')
            .click();
        cy.yesToConfirmation();
        cy.dataCy('start-evaluation').should('exist');
    });

    it('should be able to delete utterances and some to training data', function() {
        cy.dataCy('add-to-training-data').should('have.class', 'disabled');
        cy.get('.row').should('have.length', 3);
        cy.selectOrUnselectIncomingRow('banana');
        cy.deleteSelectedUtterances(); // should move focus to next
        cy.get('.row').should('have.length', 2);
        cy.toggleValidationOfSelectedUtterances();
        cy.dataCy('add-to-training-data').should('not.have.class', 'disabled')
            .click();
        cy.yesToConfirmation();
        cy.get('.row').should('have.length', 1);
        cy.visit('/project/bf/nlu/models');
        cy.get('@texts').then((text) => { // saved from toggleValidationOfSelectedUtterances
            cy.contains('.row', text[0]).should('exist');
        });
    });

    it('should batch change intent, batch validate, and batch delete', function() {
        cy.selectOrUnselectIncomingRow('apple');
        cy.dataCy('activity-command-bar').should('not.exist');
        cy.selectOrUnselectIncomingRow('banana');
        cy.dataCy('activity-command-bar').should('exist').should('contain.text', '2 selected');
        cy.changeIntentOfSelectedUtterances('fruit');
        cy.get('.virtual-table').findCy('invalidate-utterance').should('have.length', 2);
        cy.selectOrUnselectIncomingRow('banana');
        cy.selectOrUnselectIncomingRow('kiwi');
        cy.deleteSelectedUtterances();
        cy.get('.row').should('have.length', 1).should('contain.text', 'banana');
    });

    it('should batch validate', function() {
        cy.selectOrUnselectIncomingRow('apple');
        cy.dataCy('activity-command-bar').should('not.exist');
        cy.selectOrUnselectIncomingRow('banana');
        cy.dataCy('activity-command-bar').should('exist').should('contain.text', '2 selected');
        cy.toggleValidationOfSelectedUtterances();
        cy.get('.virtual-table').findCy('invalidate-utterance').should('have.length', 2);
    });

    it('should automatically validate the utterance if there is an intent', function() {
        cy.selectOrUnselectIncomingRow('apple');
        cy.selectOrUnselectIncomingRow('banana');
        cy.changeIntentOfSelectedUtterances('fruit');
        cy.get('.virtual-table').findCy('invalidate-utterance').should('have.length', 2);
    });

    it('should not automatically validate the utterance  when there is no intent', function() {
        cy.selectOrUnselectIncomingRow('apple');
        cy.dataCy('remove-intent').first().click({ force: true });
        cy.get('.virtual-table').findCy('validate-utterance').should('have.length', 3);
    });
});
