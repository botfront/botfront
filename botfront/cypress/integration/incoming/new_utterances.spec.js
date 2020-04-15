/* global cy Cypress:true */

describe('incoming page', function() {
    beforeEach(function() {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
        cy.waitForResolve(Cypress.env('RASA_URL'));
        cy.request('DELETE', `${Cypress.env('RASA_URL')}/model`);
    });

    afterEach(function() {
        cy.logout();
    });

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
    
    const addNewUtterances = () => {
    // add utterances with populate
        cy.visit('/project/bf/incoming');
        cy.dataCy('populate')
            .click({ force: true });
        cy.get('textarea')
            .click()
            .type('apple{enter}kiwi{enter}orange');
        cy.get('button')
            .contains('Add Utterances')
            .click();
        // define intents of new utterances
        cy.get('button').should('not.have.class', 'loading');
        cy.dataCy('newutterances')
            .click();
        cy.wait(100);
        cy.dataCy('intent-label')
            .first()
            .click({ force: true })
            .type('fruit{enter}');
    };

    it('should show available languages in the language selector', function() {
        cy.visit('/project/bf/incoming');
        // check project language exists
        cy.dataCy('language-selector')
            .click()
            .find('span')
            .contains('English')
            .should('exist');
        cy.dataCy('language-selector')
            .click()
            .find('span')
            .contains('French')
            .should('not.exist');
        // add another language
        cy.visit('/project/bf/settings');
        cy.dataCy('language-selector')
            .click({ force: true })
            .find('.item')
            .contains('French')
            .click({ force: true });
        cy.dataCy('save-changes')
            .click({ force: true });
        cy.get('.s-alert-success').should('be.visible');
        // check both languages are available
        cy.visit('/project/bf/incoming');
        cy.dataCy('language-selector')
            .click()
            .find('span')
            .contains('English')
            .should('exist');
        cy.dataCy('language-selector')
            .click()
            .find('span')
            .contains('French')
            .should('exist');
    });


    it('should be able to link to evaluation from new utterances', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('train-button')
            .click();
        cy.wait(1000);
        cy.get('[data-cy=train-button]').should('not.have.class', 'disabled');
        // add utterances with populate
        addNewUtterances();
        // validate utterances and run evaluation
        cy.dataCy('invalid-utterance-button')
            .first()
            .click({ force: true });
        cy.dataCy('process-in-bulk')
            .click({ force: true });
        cy.dataCy('choose-action-dropdown')
            .click()
            .find('.item')
            .contains('Run evaluation')
            .click({ force: true });
        cy.get('.dimmer')
            .find('button')
            .contains('OK')
            .click({ force: true });
        // check it linked to evalutaion > validated utterances
        cy.contains('Use validated examples')
            .should('exist');
        cy.get('.active')
            .contains('Use validated examples')
            .should('exist');
    });

    it('should be able to add new utterances to nlu', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('train-button')
            .click();
        cy.wait(1000);
        cy.get('[data-cy=train-button]').should('not.have.class', 'disabled');
        // add utterances with populate
        addNewUtterances();
        // validate utterances and run evaluation
        cy.dataCy('utterance-text')
            .should('have.length', 3);
        cy.dataCy('invalid-utterance-button')
            .first()
            .click({ force: true });
        cy.dataCy('process-in-bulk')
            .click({ force: true });
        cy.dataCy('choose-action-dropdown')
            .click({ force: true })
            .find('.item')
            .contains('Add to training data')
            .click({ force: true });
        cy.get('.dimmer')
            .find('button')
            .contains('OK')
            .click();
        cy.dataCy('utterance-text')
            .should('have.length', 2);
        // check utterances were added to nlu data
        cy.get('.project-sidebar')
            .find('.item')
            .contains('NLU')
            .click({ force: true });
        cy.dataCy('utterance-text')
            .should('have.length', 1);
        cy.dataCy('intent-label')
            .contains('fruit')
            .should('exist');
        cy.dataCy('icon-gem').should('have.class', 'active');
    });

    it('should be able to invalidate utterances', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('train-button')
            .click();
        cy.wait(1000);
        cy.get('[data-cy=train-button]').should('not.have.class', 'disabled');
        // add utterances with populate
        addNewUtterances();
        cy.dataCy('invalid-utterance-button')
            .first()
            .click({ force: true });
        cy.dataCy('process-in-bulk')
            .click({ force: true });
        cy.dataCy('choose-action-dropdown')
            .click()
            .find('.item')
            .contains('Invalidate')
            .click({ force: true });
        cy.get('.dimmer')
            .find('button')
            .contains('OK')
            .click({ force: true });
        cy.dataCy('valid-utterance-button')
            .should('not.exist');
    });

    it('should be possible to view the conversation from the utterance', function() {
        cy.addConversation('bf', 'test', conversationToAdd);
        cy.updateConversation('bf', 'test', conversationUpdate);

        cy.visit('/project/bf/incoming');
        cy.get('.utterance-viewer').should('have.text', 'test conv link');
        cy.dataCy('conversation-viewer').first().click({ force: true });
        cy.get('.popup').should('exist');
        cy.get('.popup').should('contains.text', 'test conv link');
    });
});
