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
        cy.addConversationFromTemplate('bf', 'action_test', 'actiontest');
        cy.visit('/project/bf/analytics');
        // add an included intent and action
        cy.dataCy('analytics-card')
            .first()
            .find('[data-cy=edit-includeIntents]')
            .click({ force: true });
        cy.dataCy('settings-portal-dropdown')
            .click();
        cy.dataCy('settings-portal-dropdown')
            .find('input')
            .type('intent_test{enter}{esc}');
        cy.dataCy('analytics-card')
            .first()
            .find('[data-cy=edit-includeActions]')
            .click({ force: true });
        cy.dataCy('settings-portal-dropdown').click();
        cy.dataCy('settings-portal-dropdown')
            .find('input')
            .type('action_test{enter}{esc}');
        // click on the most recent data in the graph
        cy.dataCy('analytics-card')
            .first()
            .find('[data-cy=bar-chart-button]')
            .click();
        cy.dataCy('analytics-card').first().find('rect').last()
            .click();
        // check that the correct filters were set on the conversation page
        cy.dataCy('intent-filter').find('.label').should('have.length', 1); // wait for page to load
        cy.dataCy('action-filter').find('.label').should('have.length', 1); // wait for page to load
        cy.get('.label').contains('intent_test').should('exist');
        cy.get('.label').contains('action_test').should('exist');
        cy.dataCy('date-picker-container')
            .find('button')
            .contains(`${moment().format('DD/MM/YYYY')} - ${moment().format('DD/MM/YYYY')}`); // the date range should only include the current day
    });
    it('should link from the actions card', () => {
        cy.addConversationFromTemplate('bf', 'action_test', 'actiontest');
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 6); // wait for page to load
        // add an included action
        cy.dataCy('analytics-card')
            .last()
            .find('[data-cy=edit-includeActions]')
            .click({ force: true });
        cy.dataCy('settings-portal-dropdown').click();
        cy.dataCy('settings-portal-dropdown')
            .find('input')
            .type('action_test{enter}{esc}');
        // click on the most recent data in the graph
        cy.dataCy('analytics-card')
            .last()
            .find('[data-cy=bar-chart-button]')
            .click();
        cy.dataCy('analytics-card').last().find('rect').last()
            .click();
        // check that the correct filters were set on the conversation page
        cy.dataCy('action-filter').find('.label').should('have.length', 2); // wait for page to load
        cy.get('.label').contains('action_test').should('exist');
        cy.get('.label').contains('action_botfront_fallback').should('exist');
        cy.dataCy('date-picker-container')
            .find('button')
            .contains(`${moment().format('DD/MM/YYYY')} - ${moment().format('DD/MM/YYYY')}`); // the date range should only include the current day
    });
    it('should link with conversation duration, > 180', () => {
        cy.addConversationFromTemplate('bf', 'default', 'default', { duration: 181 });
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 6); // wait for the page to load
        cy.dataCy('analytics-card').eq(3).find('rect').last()
            .click();
        cy.dataCy('conversation-item').should('exist'); // wait for the page to load
        cy.dataCy('duration-filter-from').find('input').should('have.value', '180');
    });
    it('should link with conversation duration, < 30', () => {
        cy.addConversationFromTemplate('bf', 'default', 'default', { duration: 10 });
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 6); // wait for the page to load
        cy.dataCy('analytics-card').eq(3).find('rect').last()
            .click();
        cy.dataCy('conversation-item').should('exist'); // wait for the page to load
        cy.dataCy('duration-filter-to').find('input').should('have.value', '30');
    });
    it('should link with conversation duration 30 to 60', () => {
        cy.addConversationFromTemplate('bf', 'default', 'default', { duration: 31 });
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 6); // wait for the page to load
        cy.dataCy('analytics-card').eq(3).find('rect').last()
            .click();
        cy.dataCy('conversation-item').should('exist'); // wait for the page to load
        cy.dataCy('duration-filter-from').find('input').should('have.value', '30');
        cy.dataCy('duration-filter-to').find('input').should('have.value', '60');
    });
    it('should link with conversation length from the conversation length card', () => {
        cy.addConversationFromTemplate('bf', 'len_3', 'len3');
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 6); // wait for the page to load
        cy.dataCy('analytics-card').eq(1).find('rect').last()
            .click();
        cy.dataCy('conversation-item').should('exist'); // wait for the page to load
        cy.dataCy('length-filter').find('input').should('have.value', '3');
        cy.dataCy('length-filter').find('.text').contains('=').should('exist');
    });
    it('should link with an intent from top 10 intents', () => {
        cy.addConversationFromTemplate('bf', 'intent_test', 'intenttest');
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 6); // wait for the page to load
        cy.dataCy('analytics-card').eq(2).find('rect').last()
            .click();
        cy.dataCy('conversation-item').should('exist'); // wait for the page to load
        cy.dataCy('intent-filter').find('.label').should('have.length', 1); // wait for page to load
        cy.get('.label').contains('intent_dummy').should('exist');
    });
    it('should set the date when linking from an analytics card', () => {
        cy.visit('/project/bf/analytics');
        cy.addConversationFromTemplate('bf', 'intent_test', 'intenttest');
        cy.dataCy('analytics-card').should('have.length', 6); // wait for the page to load
        // set date to a 30 day range
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
});
