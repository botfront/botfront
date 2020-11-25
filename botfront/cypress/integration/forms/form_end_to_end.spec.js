/* global cy Cypress expect */

const newFormName = 'Defaultstories_1_form';

const policices = `policies:
- name: KerasPolicy
  epochs: 50
- name: FallbackPolicy
- name: AugmentedMemoizationPolicy
- name: FormPolicy`;

const addextractionFromMessage = (slot) => {
    cy.dataCy(`slot-node-${slot}`).click();
    cy.dataCy('form-top-menu-item').contains('Extraction').click();
    cy.dataCy('extraction-source-dropdown').click();
    cy.dataCy('extraction-source-dropdown').find('span.text').contains('from the user message').click();
    cy.dataCy('extraction-source-dropdown').find('div.text').should('have.text', 'from the user message');
};

describe('test forms end to end', () => {
    beforeEach(() => {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
    });

    afterEach(() => {
        cy.request('DELETE', `${Cypress.env('RASA_URL')}/model`);
        cy.logout();
        cy.deleteProject('bf');
    });

    it('should create a form, use it, and view the result', () => {
        cy.setPolicies('bf', policices);

        cy.visit('project/bf/dialogue');
        cy.meteorAddSlot('bool_slot', 'bool');
        cy.createFormInGroup({ groupName: 'Default stories' });
        cy.createFormInGroup({ groupName: 'Default stories' });
        cy.selectForm(newFormName);

        cy.dataCy('start-node').click();
        cy.dataCy('side-questions').click();
        cy.dataCy('form-collection-togglefield').click();
        cy.dataCy('toggled-true').should('exist');

        cy.addSlotNode('1', 'slot1');

        addextractionFromMessage('slot1');

        cy.addSlotSetNode('slot1', 'bool', 'bool_slot', 'true');

        cy.dataCy('add-node-slot1').should('have.class', 'disabled');

        cy.get('.if-button').last().click();

        cy.dataCy('condition-modal').contains('Add rule').click();
        cy.dataCy('condition-modal').contains('Select field').click();
        cy.dataCy('condition-modal').find('.dropdown .item').contains('slot1').click();
        cy.dataCy('condition-modal').find('.rule--body input').eq(2).type('oui');
        cy.get('.ui.modals.dimmer').click('topLeft');

        cy.dataCy('add-node-slot1').should('not.have.class', 'disabled');
        cy.addSlotSetNode('slot1', 'bool', 'bool_slot', 'false');
        cy.dataCy('slot-set-node').should('have.length', 2);
        cy.reload();
        cy.createStoryGroup();
        cy.createStoryInGroup({ storyName: 'testStory ' });
        cy.addUtteranceLine({ intent: 'trigger_form' });
        cy.dataCy('add-form-line').click({ force: true });
        cy.dataCy('start-form').click({ force: true });
        cy.dataCy('start-form').find('span.text').contains(newFormName).click({ force: true });
        cy.dataCy('complete-form').last().click({ force: true });

        cy.dataCy('create-branch').click();
        cy.dataCy('add-slot-line').should('have.length', 2);
        cy.dataCy('value-bool_slot-true').last().click({ force: true });
        cy.dataCy('from-text-template').last().click({ force: true });
        cy.dataCy('bot-response-input').find('textarea').click();
        cy.dataCy('bot-response-input').find('textarea').type('path A {bool_slot}', { parseSpecialCharSequences: false });

        cy.dataCy('branch-label').last().click();
        cy.get('.label-container.orange').should('not.exist');

        cy.dataCy('add-slot-line').should('have.length', 2);
        cy.dataCy('value-bool_slot-false').last().click({ force: true });
        cy.dataCy('from-text-template').last().click({ force: true });
        cy.dataCy('bot-response-input').last().find('textarea').click();
        cy.dataCy('bot-response-input').last().find('textarea').type('path B {bool_slot}', { parseSpecialCharSequences: false });
        cy.dataCy('branch-label').last().click();
        
        cy.train();
        cy.newChatSesh();
        cy.contains('utter_get_started');
        cy.testChatInput('/trigger_form', 'utter_ask_slot1');
        cy.testChatInput('oui', 'path A true');

        cy.newChatSesh();
        cy.contains('utter_get_started');
        cy.testChatInput('/trigger_form', 'utter_ask_slot1');
        cy.testChatInput('non', 'Path B');
    });

    it('should create, use, and view the results of a form', () => {
        const benchmarkDate = new Date();
        cy.setPolicies('bf', policices);

        cy.visit('project/bf/dialogue');
        cy.createFormInGroup({ groupName: 'Default stories' });
        cy.createFormInGroup({ groupName: 'Default stories' });
        cy.selectForm(newFormName);

        cy.dataCy('start-node').click();
        cy.dataCy('side-questions').click();
        cy.dataCy('form-collection-togglefield').click();
        cy.dataCy('toggled-true').should('exist');

        cy.addSlotNode('1', 'slot1');

        addextractionFromMessage('slot1');

        cy.addSlotNode('slot1', 'oui');

        addextractionFromMessage('oui');

        cy.dataCy('add-node-slot1').should('have.class', 'disabled');

        cy.dataCy('edge-button-slot1-oui').click();

        cy.dataCy('condition-modal').contains('Add rule').click();
        cy.dataCy('condition-modal').contains('Select field').click();
        cy.dataCy('condition-modal').find('.dropdown .item').contains('slot1').click();
        cy.dataCy('condition-modal').find('.rule--body input').eq(2).type('oui');
        cy.get('.ui.modals.dimmer').click('topLeft');

        cy.dataCy('add-node-slot1').should('not.have.class', 'disabled');
        cy.addSlotNode('slot1', 'non');

        cy.createStoryGroup();
        cy.createStoryInGroup({ storyName: 'testStory ' });
        cy.addUtteranceLine({ intent: 'trigger_form' });
        cy.dataCy('add-form-line').click({ force: true });
        cy.dataCy('start-form').click({ force: true });
        cy.dataCy('start-form').find('span.text').contains(newFormName).click({ force: true });

        cy.train();
        cy.newChatSesh();
        cy.contains('utter_get_started');
        cy.testChatInput('/trigger_form', 'utter_ask_slot1');
        cy.testChatInput('oui', 'utter_ask_oui');
        cy.typeChatMessage('text slot value');

        cy.newChatSesh();
        cy.contains('utter_get_started');
        cy.testChatInput('/trigger_form', 'utter_ask_slot1');
        cy.testChatInput('non', 'utter_ask_non');
        cy.typeChatMessage('text slot value');

        cy.dataCy('incoming-sidebar-link').click({ force: true });
        cy.dataCy('forms').click();
        cy.get('.ui.header').should('include.text', newFormName);
        cy.dataCy('export-form-submissions').eq(1).should('include.text', 'Export 2 submissions to CSV format').click();
        cy.getWindowMethod('getCsvData').then((getCsvData) => {
            const csvData = getCsvData().split('\n')[1].split(',');
            const [date, textSlot] = [csvData[0], csvData[csvData.length - 1]];
            expect(Math.abs(new Date(date) - benchmarkDate) / 1000).to.be.below(5 * 60);
            expect(textSlot).to.be.equal('"text slot value"');
        });
    });
});
