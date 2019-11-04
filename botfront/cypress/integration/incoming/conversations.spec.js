
/* eslint-disable no-undef */
const apiHost = 'http://localhost:8080';

function addConversation(id) {
    let url = `http://localhost:8080/project/bf/conversations/${id}/insert?api-key=`;
    if (Cypress.env('API_URL') !== '') {
        url = `${Cypress.env('API_URL')}/project/bf/conversations/${id}/insert?api-key=`;
    }

    const body = {
        sender_id: 'test',
        slots: {
            disambiguation_message: null,
        },
        latest_message: {
            text: '/get_started',
            intent: {
                name: 'get_started',
                confidence: 1,
            },
            intent_ranking: [
                {
                    name: 'get_started',
                    confidence: 1,
                },
            ],
            entities: [

            ],
        },
        latest_event_time: 1572982150.8615842,
        followup_action: null,
        paused: false,
        events: [
            {
                event: 'action',
                timestamp: 1572982150.8264863,
                name: 'action_listen',
                policy: null,
                confidence: null,
            },
            {
                event: 'user',
                timestamp: 1572982150.8352745,
                text: `"/get_started_${id}"`,
                parse_data: {
                    text: `"/get_started_${id}"`,
                    intent: {
                        name: `"get_started_${id}"`,
                        confidence: 1,
                    },
                    intent_ranking: [
                        {
                            name: `"get_started_${id}"`,
                            confidence: 1,
                        },
                    ],
                    entities: [

                    ],
                },
                input_channel: 'webchat',
                message_id: '7c17782e578348cda0f336333e4a4008',
                metadata: null,
            },
            {
                event: 'action',
                timestamp: 1572982150.8542428,
                name: 'utter_get_started',
                policy: 'policy_1_AugmentedMemoizationPolicy',
                confidence: 1,
            },
            {
                event: 'bot',
                timestamp: 1572982150.854263,
                text: 'utter_get_started',
                data: {
                    elements: null,
                    quick_replies: null,
                    buttons: null,
                    attachment: null,
                    image: null,
                    custom: null,
                },
                metadata: {

                },
            },
            {
                event: 'action',
                timestamp: 1572982150.8615842,
                name: 'action_listen',
                policy: 'policy_1_AugmentedMemoizationPolicy',
                confidence: 1,
            },
        ],
        latest_input_channel: 'webchat',
        active_form: {

        },
        latest_action_name: 'action_listen',
    };
    cy.request({
        method: 'POST',
        url,
        headers: { 'Content-Type': 'application/json' },
        body,
    });
}

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


describe('incoming page conversation tab pagination', function () {
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

    it('should have no pagination if 20 conversation or less', function () {
        for (let i = 0; i < 20; i += 1) {
            addConversation(`test${i}`);
        }
        cy.wait(1000);
        cy.visit('/project/bf/incoming');
        cy.dataCy('incoming-conversations-tab')
            .click();
        cy.dataCy('pagination').should('not.exist');
        cy.dataCy('conversation-item').should('have.length', 20);
    });

    it('should have pagination if more than 20 conversations', function () {
        for (let i = 0; i < 25; i += 1) {
            addConversation(`test${i}`);
        }
        cy.wait(1000);
        cy.visit('/project/bf/incoming');
        cy.dataCy('incoming-conversations-tab')
            .click();
        cy.dataCy('conversation-item').should('have.length', 20);
        cy.dataCy('pagination').should('exist');
        cy.dataCy('pagination').children().last().click({ force: true });
        cy.dataCy('conversation-item').should('have.length', 5);
    });
});

describe('incoming page', function() {
    beforeEach(function() {
        cy.deleteProject('bf');
        // delete before
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
        cy.visit('/project/bf/settings');
        cy.dataCy('project-settings-more')
            .click();
        cy.dataCy('admin-settings-menu')
            .find('a')
            .contains('Docker Compose')
            .click();
        cy.dataCy('docker-api-host')
            .click();
        cy.dataCy('docker-api-host')
            .find('input')
            .clear()
            .type(`${apiHost}{enter}`);
        cy.visit('/project/bf/settings');
        cy.contains('Import/Export').click();
        cy.dataCy('import-type-dropdown')
            .click();
        cy.dataCy('import-type-dropdown')
            .find('span')
            .contains('Botfront')
            .click();
        cy.fixture('botfront_project_import.json', 'utf8').then((content) => {
            cy.get('.file-dropzone').upload(content, 'data.json');
        });
        cy.dataCy('skip')
            .click();
        cy.get('.dimmer').find('.ui.primary.button').click();
        cy.dataCy('import-button')
            .click();
        cy.dataCy('project-import-success').should('exist');
    });
    it('should have be able to navigate conversations with the menu', function() {
        cy.visit('/project/bf/incoming');
    });
    it('should have be able to change pages', function() {
    });
    it('should go to the same page and conversation when refreshed', function() {
        cy.dataCy('incoming-conversations-tab')
            .click();
        cy.dataCy('conversation-menu-item')
            .first()
            .should('have.class', 'active');
        cy.dataCy('conversation-menu-item')
            .eq(5)
            .click();
        cy.dataCy('conversation-menu-item')
            .first()
            .should('not.have.class', 'active');
        cy.dataCy('conversations-next-page')
            .click();
        cy.dataCy('conversations-next-page')
            .should('not.exist');
        cy.dataCy('conversations-previous-page')
            .click();
        cy.dataCy('conversations-previous-page')
            .should('not.exist');
    });
});
