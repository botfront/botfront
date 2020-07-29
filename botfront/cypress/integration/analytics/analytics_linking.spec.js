/* eslint-disable no-undef */
import moment from 'moment';

describe('link from analytics to conversations and apply filters', () => {
    beforeEach(() => {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
            cy.setTimezoneOffset();
        });
    });
    afterEach(() => {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('should link from the conversations card', () => {
        cy.addConversationFromTemplate('bf', 'intent_test', 'intenttest');
        cy.addConversationFromTemplate('bf', 'action_test', 'intenttest');
        cy.visit('/project/bf/analytics');
        // add an included intent and action
        cy.dataCy('analytics-card')
            .first()
            .find('[data-cy=edit-intentsAndActionsFilters]')
            .click({ force: true });
        cy.dataCy('sequence-selector').click();
        cy.dataCy('sequence-selector').find('input').should('exist');
        cy.dataCy('sequence-selector').find('input').click();
        cy.dataCy('sequence-selector').find('input').type('intent_test{enter}');
        cy.dataCy('sequence-selector').click();
        cy.dataCy('sequence-selector').find('input').should('exist');
        cy.dataCy('sequence-selector').find('input').click();
        cy.dataCy('sequence-selector').find('input').type('action_test{enter}');
        cy.dataCy('sequence-selector').click();
        cy.dataCy('sequence-selector').find('input').should('exist');
        cy.dataCy('sequence-selector').find('input').click();
        cy.dataCy('sequence-selector').find('input').type('get_started{enter}');
        cy.dataCy('sequence-step-2').click();
        cy.dataCy('sequence-step-2').should('have.class', 'red');
        cy.escapeModal();
        cy.dataCy('analytics-card')
            .first()
            .find('[data-cy=edit-conversationLength]')
            .click({ force: true });
        cy.dataCy('settings-portal-input').find('input').clear().type('1{esc}');
        // click on the most recent data in the graph
        cy.dataCy('analytics-card')
            .first()
            .find('[data-cy=bar-chart-button]')
            .click();
        cy.dataCy('analytics-card').first().find('rect').last()
            .click();
        // check that the correct filters were set on the conversation page
        cy.dataCy('intents-actions-filter').find('.label').should('have.length', 3); // wait for page to load
        cy.get('.label').contains('intent_test').should('exist');
        cy.get('.label').contains('action_test').should('exist');
        cy.get('.label').contains('get_started').should('exist').should('have.class', 'red');
        cy.dataCy('conversation-length-filter').find('input').should('have.value', '1');
        cy.dataCy('date-picker-container')
            .find('button')
            .contains(`${moment().format('DD/MM/YYYY')} - ${moment().format('DD/MM/YYYY')}`); // the date range should only include the current day
    });

    it('should link from the conversations card in production', () => {
        cy.visit('/project/bf/settings');
        cy.contains('Project Info').click();
        cy.dataCy('deployment-environments')
            .children()
            .contains('production')
            .click();
        cy.dataCy('save-changes').click();
        cy.addConversationFromTemplate('bf', 'intent_test', 'intenttest', { env: 'production' });
        cy.addConversationFromTemplate('bf', 'action_test', 'actiontest', { env: 'production' });
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 7);
        cy.changeEnv('production');
        // add an included intent
        cy.dataCy('analytics-card')
            .first()
            .find('[data-cy=edit-intentsAndActionsFilters]')
            .click({ force: true });
        cy.dataCy('sequence-selector').click();
        cy.dataCy('sequence-selector').find('input').should('exist');
        cy.dataCy('sequence-selector').find('input').click();
        cy.dataCy('sequence-selector').find('input').type('intent_test{enter}');
        cy.dataCy('sequence-selector').click();
        cy.escapeModal();
       
        // click on the most recent data in the graph
        cy.dataCy('analytics-card')
            .first()
            .find('[data-cy=bar-chart-button]')
            .click();
        cy.dataCy('analytics-card').first().find('rect').last()
            .click();
        // check that the correct filters were set on the conversation page
        cy.dataCy('intents-actions-filter').find('.label').should('have.length', 1); // wait for page to load
        cy.get('.label').contains('intent_test').should('exist');
        cy.dataCy('conversation-item').should('have.length', 1);
        cy.dataCy('env-selector').find('div.text').should('exist').should('have.text', 'production');
    });

    it('should link from the actions card', () => {
        cy.addConversationFromTemplate('bf', 'action_test', 'actiontest');
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 7); // wait for page to load
        // add an included action
        cy.dataCy('analytics-card')
            .eq(5)
            .find('[data-cy=edit-includeActions]')
            .click({ force: true });
        cy.dataCy('settings-portal-dropdown').click();
        cy.dataCy('settings-portal-dropdown')
            .find('input')
            .type('action_test{enter}{esc}');
        // click on the most recent data in the graph
        cy.dataCy('analytics-card')
            .eq(5)
            .find('[data-cy=bar-chart-button]')
            .click();
        cy.dataCy('analytics-card').eq(5).find('rect').last()
            .click();
        // check that the correct filters were set on the conversation page
        cy.dataCy('intents-actions-filter').find('.label').should('have.length', 2); // wait for page to load
        cy.get('.label').contains('action_test').should('exist');
        cy.get('.label').contains('action_botfront_fallback').should('exist');
        cy.dataCy('date-picker-container')
            .find('button')
            .contains(`${moment().format('DD/MM/YYYY')} - ${moment().format('DD/MM/YYYY')}`); // the date range should only include the current day
    });
    it('should link with conversation duration, > 180', () => {
        cy.addConversationFromTemplate('bf', 'default', 'default', { duration: 181 });
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 7); // wait for the page to load
        cy.dataCy('analytics-card').eq(3).find('rect').last()
            .click();
        cy.dataCy('conversation-item').should('exist'); // wait for the page to load
        cy.dataCy('duration-filter-from').find('input').should('have.value', '180');
    });
    it('should link with conversation duration, < 30', () => {
        cy.addConversationFromTemplate('bf', 'default', 'default', { duration: 10 });
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 7); // wait for the page to load
        cy.dataCy('analytics-card').eq(3).find('rect').last()
            .click();
        cy.dataCy('conversation-item').should('exist'); // wait for the page to load
        cy.dataCy('duration-filter-to').find('input').should('have.value', '30');
    });
    it('should link with conversation duration 30 to 60', () => {
        cy.addConversationFromTemplate('bf', 'default', 'default', { duration: 31 });
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 7); // wait for the page to load
        cy.dataCy('analytics-card').eq(3).find('rect').last()
            .click();
        cy.dataCy('conversation-item').should('exist'); // wait for the page to load
        cy.dataCy('duration-filter-from').find('input').should('have.value', '30');
        cy.dataCy('duration-filter-to').find('input').should('have.value', '60');
    });
    it('should link with conversation length from the conversation length card', () => {
        cy.addConversationFromTemplate('bf', 'len_3', 'len3');
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 7); // wait for the page to load
        cy.dataCy('analytics-card').eq(1).find('rect').last()
            .click();
        cy.dataCy('conversation-item').should('exist'); // wait for the page to load
        cy.dataCy('length-filter').find('input').should('have.value', '3');
        cy.dataCy('length-filter').find('.text').contains('=').should('exist');
    });
    it('should link with an intent from top 10 intents', () => {
        cy.addConversationFromTemplate('bf', 'intent_test', 'intenttest');
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 7); // wait for the page to load
        cy.dataCy('analytics-card').eq(2).find('rect').last()
            .click();
        cy.dataCy('conversation-item').should('exist'); // wait for the page to load
        cy.dataCy('intents-actions-filter').find('.label').should('have.length', 1); // wait for page to load
        cy.get('.label').contains('intent_dummy').should('exist');
    });
    it('should set the date when linking from an analytics card', () => {
        cy.visit('/project/bf/analytics');
        cy.addConversationFromTemplate('bf', 'intent_test', 'intenttest');
        cy.dataCy('analytics-card').should('have.length', 7); // wait for the page to load
        // set date to a 30 day range
        cy.dataCy('analytics-card').eq(2).find('.loader').should('not.exist');
        cy.dataCy('analytics-card').eq(2).find('[data-cy=date-picker-container]').click();
        cy.dataCy('date-range-selector').click();
        cy.dataCy('date-range-selector').find('span.text')
            .contains('Last 30 days')
            .click({ force: true });
        cy.dataCy('apply-new-dates').click();
        // verify the date is correct
        cy.dataCy('analytics-card').eq(2).find('rect').last()
            .click();
        cy.dataCy('conversation-item').should('exist'); // wait for the page to load
        cy.dataCy('date-picker-container').find('button')
            .contains(`${moment().subtract(29, 'days').startOf('day').format('DD/MM/YYYY')} - ${moment().format('DD/MM/YYYY')}`);
    });

    it('should set the correct order from an funnnel', () => {
        cy.addConversationFromTemplate('bf', 'action_test', 'actiontest1');
        cy.addConversationFromTemplate('bf', 'action_test', 'actiontest2');
        cy.addConversationFromTemplate('bf', 'action_autre', 'actionautre1');
        cy.addConversationFromTemplate('bf', 'action_autre', 'actionautre2');
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 7); // wait for the page to load
        // set date to a 30 day range
        cy.dataCy('create-card').click();
        cy.dataCy('create-card').find('div.item').eq(6).click();
        cy.dataCy('analytics-card').should('have.length', 8);
        cy.dataCy('card-ellipsis-menu').first().click();
        cy.dataCy('edit-selectedSequence').click({ force: true });
        cy.dataCy('remove-step-0').click();
        cy.dataCy('sequence-selector')
            .click()
            .find('input')
            .type('chitchat.greet');
        cy.dataCy('add-option')
            .click();
        cy.dataCy('sequence-selector')
            .click()
            .find('input')
            .type('action_test');
        cy.dataCy('add-option')
            .click();
        cy.get('.page').click({ force: true });
        cy.dataCy('analytics-card').first().find('rect').last()
            .click();
       

        cy.dataCy('intents-actions-filter').find('.label').should('have.length', 2); // wait for page to load
        cy.get('.label').contains('chitchat.greet').should('exist');
        cy.get('.label').contains('action_test').should('exist');
        cy.dataCy('intents-actions-filter').find('.and-or-order div.text').should('have.text', 'In order');
        cy.get(' .four > .ui ').should('have.text', 'actiontest2actiontest1');
    });

    it('should set the correct order from an funnnel with exclusion', () => {
        cy.addConversationFromTemplate('bf', 'action_test', 'actiontest1');
        cy.addConversationFromTemplate('bf', 'action_test', 'actiontest2');
        cy.addConversationFromTemplate('bf', 'action_autre', 'actionautre1');
        cy.addConversationFromTemplate('bf', 'action_autre', 'actionautre2');
        cy.addConversationFromTemplate('bf', 'action_test_and_autre', 'actiontestautre');
        cy.visit('/project/bf/analytics');
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 7); // wait for the page to load
        // set date to a 30 day range
        cy.dataCy('create-card').click();
        cy.dataCy('create-card').find('div.item').eq(6).click();
        cy.dataCy('analytics-card').should('have.length', 8);
        cy.dataCy('card-ellipsis-menu').first().click();
        cy.dataCy('edit-selectedSequence').click({ force: true });
        cy.dataCy('remove-step-0').click();
        cy.dataCy('sequence-selector')
            .click()
            .find('input')
            .type('chitchat.greet');
        cy.dataCy('add-option')
            .click();
        cy.dataCy('sequence-selector')
            .click()
            .find('input')
            .type('action_test');
        cy.dataCy('add-option')
            .click();
        cy.dataCy('sequence-selector')
            .click()
            .find('input')
            .type('action_autre');
        cy.dataCy('add-option')
            .click();
        cy.dataCy('sequence-step-2').click();

        cy.get('.page').click({ force: true });
        cy.dataCy('analytics-card').first().find('rect').last()
            .click();

        cy.dataCy('intents-actions-filter').find('.label').should('have.length', 3); // wait for page to load
        cy.get('.label').contains('chitchat.greet').should('exist');
        cy.get('.label').contains('action_test').should('exist');
        cy.dataCy('intents-actions-filter').find('.and-or-order div.text').should('have.text', 'In order');
        cy.get(' .four > .ui ').should('have.text', 'actiontest2actiontest1');
    });
    it('should link from a pie chart', () => {
        cy.addConversationFromTemplate('bf', 'intent_test', 'intenttest');
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 7); // wait for the page to load
        cy.dataCy('analytics-card').eq(2).find('[data-cy=pie-chart-button]').click();
        cy.dataCy('analytics-card').eq(2).find('path').first()
            .click({ force: true });
        cy.dataCy('conversation-item').should('exist'); // wait for the page to load
        cy.dataCy('intents-actions-filter').find('.label').should('have.length', 1); // wait for page to load
        cy.get('.label').contains('intent_dummy').should('exist');
    });
});
