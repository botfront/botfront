/* global cy Cypress:true */

const conversationToAdd = {
    sender_id: 'test',
    slots: {
        disambiguation_message: null,
    },
    latest_message: {
        intent: {},
        entities: [],
        text: null,
        message_id: null,
        metadata: null,
    },
    latest_event_time: 1573490208.456171,
    followup_action: null,
    paused: false,
    events: [
        {
            event: 'action',
            timestamp: 1573490208.294734,
            name: 'action_listen',
            policy: null,
            confidence: null,
        }],
    latest_input_channel: 'webchat',
    active_form: {},
    latest_action_name: 'action_listen',
};


const conversationUpdate = {
    latest_message: {
        intent: {},
        entities: [],
        text: null,
        message_id: null,
        metadata: null,
    },
    events: [
        {
            event: 'user',
            timestamp: 1573490208.4083405,
            text: 'test conv link',
            parse_data: {
                intent: {
                    name: null,
                    confidence: 0,
                },
                entities: [],
                language: 'en',
                intent_ranking: [],
                text: 'test conv link',
            },
            input_channel: 'webchat',
            message_id: '451e0d9d8b494c5aafae0f4ae923004f',
            metadata: { language: 'en' },
        }],
    latest_input_channel: 'webchat',
    active_form: {},
    latest_action_name: 'action_listen',
};

describe('incoming page', function() {
    beforeEach(function() {
        cy.deleteProject('bf');
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
        cy.toggleValidationOfSelectedUtterances();
        cy.get('.virtual-table').findCy('invalidate-utterance').should('have.length', 2);
        cy.selectOrUnselectIncomingRow('banana');
        cy.selectOrUnselectIncomingRow('kiwi');
        cy.deleteSelectedUtterances();
        cy.get('.row').should('have.length', 1).should('contain.text', 'banana');
    });

    it('should be possible to view the conversation from the utterance', function() {
        cy.addCustomConversation('bf', 'test', { events: [{ type: 'user', text: 'test conv link' }] });
        cy.visit('/project/bf/incoming');
        cy.get('.utterance-viewer').first().should('have.text', 'test conv link')
            .trigger('mouseover');
        cy.dataCy('conversation-viewer').first().click({ force: true });
        cy.get('.popup').should('exist');
        cy.get('.popup').should('contains.text', 'test conv link');
    });

    it('should move an utterance to OOS, and then to training data', function() {
        cy.get('.row:contains(banana)')
            .findCy('intent-label')
            .find('.action-on-label')
            .click({ force: true });
        cy.get('.null[data-cy=intent-label]').should('exist');
        cy.get('.row:contains(banana)').click({ force: true });
        cy.get('body').type('o');

        cy.visit('/project/bf/nlu/models');
        cy.get('a.item').contains('Out Of Scope').click();
        cy.get('.row:contains(banana)').should('exist');
        cy.dataCy('icon-plus').should('not.exist');
        cy.wait(300);
        cy.dataCy('intent-label').find('.content-on-label').click({ force: true });
        cy.get('.popup').should('exist');
        cy.get('.row:contains(greet)').click();
        cy.wait(300);
        cy.get('.row:contains(banana)').trigger('mouseover');
        cy.dataCy('icon-plus').should('exist').click({ force: true });
        
        cy.get('a.item').contains('Examples').click();
        cy.get('.row').contains('banana').should('exist');
    });
});
