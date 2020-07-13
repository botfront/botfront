/* global cy Cypress:true */

const policices = `policies:
- name: KerasPolicy
  epochs: 50
- name: FallbackPolicy
- name: AugmentedMemoizationPolicy
- name: FormPolicy`;
describe('test forms end to end', () => {
    beforeEach(() => {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
    });

    afterEach(() => {
        // cy.request('DELETE', `${Cypress.env('RASA_URL')}/model`);
        // cy.logout();
        // cy.deleteProject('bf');
        Cypress.runner.stop();
    });

    it('should create, use, and view the results of a form', () => {
        cy.visit('project/bf/stories');
        cy.meteorAddSlot('textSlot', 'text');
        cy.setPolicies('bf', policices);
        cy.manuallyCreateForm();
        cy.createStoryGroup();
        cy.dataCy('story-group-menu-item').should('include.text', 'Groupo');
        cy.createStoryInGroup({ storyName: 'testStory ' });
        cy.addUtteranceLine({ intent: 'trigger_form' });
        cy.dataCy('add-form-line').click({ force: true });
        cy.dataCy('start-form').click({ force: true });
        cy.dataCy('start-form').find('span.text').contains('test1_form').click({ force: true });
        cy.selectForm('test1_form');
        cy.addSlotToForm('textSlot');
        cy.dataCy('form-collection-togglefield').click();
        cy.dataCy('toggled-true').should('exist');
        cy.dataCy('form-submit-field').click();
        cy.selectFormSlot('textSlot');
        cy.dataCy('form-top-menu-item').contains('Extraction').click();
        cy.dataCy('extraction-source-dropdown').click();
        cy.dataCy('extraction-source-dropdown').find('span.text').contains('From the user message').click();
        cy.dataCy('extraction-source-dropdown').find('div.text').should('have.text', 'From the user message');
        cy.train();
        cy.newChatSesh();
        cy.typeChatMessage('/trigger_form', 'utter_ask_catSlot');
        cy.typeChatMessage('text slot value');
        cy.dataCy('incoming-sidebar-link').click({ force: true });
        cy.dataCy('forms').click();
        cy.get('.ui.header').should('include.text', 'test1_form');
        cy.get('.ui.button').should('include.text', 'Export 1 submission to CSV format');
    });
});
