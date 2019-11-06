/* eslint-disable no-undef */

describe('incoming page conversation tab', function () {
    beforeEach(function () {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
        cy.waitForResolve(Cypress.env('RASA_URL'));
        cy.request('DELETE', `${Cypress.env('RASA_URL')}/model`);
    });

    afterEach(function () {
        cy.logout();

    });

    function addConversation(id) {
        let url = `http://localhost:8080/project/bf/conversations/${id}/insert?api-key=`;
        if (Cypress.env('MODE') && Cypress.env('MODE') === 'CI_RUN') {
            url = `http://botfront-api:8080/project/bf/conversations/${id}/insert?api-key=`;
        }

        let body = {
            "sender_id": "test",
            "slots": {
                "disambiguation_message": null
            },
            "latest_message": {
                "text": "/get_started",
                "intent": {
                    "name": "get_started",
                    "confidence": 1
                },
                "intent_ranking": [
                    {
                        "name": "get_started",
                        "confidence": 1
                    }
                ],
                "entities": [

                ]
            },
            "latest_event_time": 1572982150.8615842,
            "followup_action": null,
            "paused": false,
            "events": [
                {
                    "event": "action",
                    "timestamp": 1572982150.8264863,
                    "name": "action_listen",
                    "policy": null,
                    "confidence": null
                },
                {
                    "event": "user",
                    "timestamp": 1572982150.8352745,
                    "text": `"/get_started_${id}"`,
                    "parse_data": {
                        "text": `"/get_started_${id}"`,
                        "intent": {
                            "name": `"get_started_${id}"`,
                            "confidence": 1
                        },
                        "intent_ranking": [
                            {
                                "name": `"get_started_${id}"`,
                                "confidence": 1
                            }
                        ],
                        "entities": [

                        ]
                    },
                    "input_channel": "webchat",
                    "message_id": "7c17782e578348cda0f336333e4a4008",
                    "metadata": null
                },
                {
                    "event": "action",
                    "timestamp": 1572982150.8542428,
                    "name": "utter_get_started",
                    "policy": "policy_1_AugmentedMemoizationPolicy",
                    "confidence": 1
                },
                {
                    "event": "bot",
                    "timestamp": 1572982150.854263,
                    "text": "utter_get_started",
                    "data": {
                        "elements": null,
                        "quick_replies": null,
                        "buttons": null,
                        "attachment": null,
                        "image": null,
                        "custom": null
                    },
                    "metadata": {

                    }
                },
                {
                    "event": "action",
                    "timestamp": 1572982150.8615842,
                    "name": "action_listen",
                    "policy": "policy_1_AugmentedMemoizationPolicy",
                    "confidence": 1
                }
            ],
            "latest_input_channel": "webchat",
            "active_form": {

            },
            "latest_action_name": "action_listen"
        }
        cy.request({
            method: 'POST',
            url,
            headers: { 'Content-Type': 'application/json' },
            body,
        });

    }
    it('should show a message if no converastions', function () {
        cy.visit('/project/bf/incoming');
        cy.dataCy('incoming-conversations-tab')
            .click();
        cy.dataCy('no-conv').should('contains.text', 'No conversation to load');
    });


    it('should be list all conversation in db', function () {
        addConversation('test1');
        addConversation('test2');
        cy.visit('/project/bf/incoming');
        cy.dataCy('incoming-conversations-tab')
            .click();
        cy.dataCy('conversation-item').should('have.length', 2);
    });

    it('should be possible to select a conversation', function () {
        addConversation('test1');
        addConversation('test2');
        cy.visit('/project/bf/incoming');
        cy.dataCy('incoming-conversations-tab')
            .click();
        cy.dataCy('conversation-item').eq(1).should('have.text', 'test1');
        cy.dataCy('conversation-item').eq(1).click({ force: true });
        cy.dataCy('nlu-table-text').should('contains.text', '/get_started_test1');
    });
});
