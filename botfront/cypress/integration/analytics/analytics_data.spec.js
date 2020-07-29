/* global cy */

const top10IntentEvents = [
    { type: 'user', text: 'get started', name: 'get_started' },
    { type: 'user', text: 'test1', name: 'TEST_1' },
    { type: 'user', text: 'test1', name: 'TEST_1' },
    { type: 'user', text: 'test2', name: 'TEST_2' },
    { type: 'user', text: 'test2', name: 'TEST_2' },
    { type: 'user', text: 'test3', name: 'TEST_3' },
    { type: 'user', text: 'test3', name: 'TEST_3' },
    { type: 'user', text: 'test4', name: 'TEST_4' },
    { type: 'user', text: 'test4', name: 'TEST_4' },
    { type: 'user', text: 'test5', name: 'TEST_5' },
    { type: 'user', text: 'test5', name: 'TEST_5' },
    { type: 'user', text: 'test6', name: 'TEST_6' },
    { type: 'user', text: 'test6', name: 'TEST_6' },
    { type: 'user', text: 'test7', name: 'TEST_7' },
    { type: 'user', text: 'test7', name: 'TEST_7' },
    { type: 'user', text: 'test8', name: 'TEST_8' },
    { type: 'user', text: 'test8', name: 'TEST_8' },
    { type: 'user', text: 'test9', name: 'TEST_9' },
    { type: 'user', text: 'test9', name: 'TEST_9' },
    { type: 'user', text: 'test10', name: 'TEST_10' },
    { type: 'user', text: 'test10', name: 'TEST_10' },
    { type: 'user', text: 'test11', name: 'TEST_11' },
];

const conversationsOverTimeEvents = [
    { type: 'user', text: 'get started', name: 'get_started' },
    { type: 'user', text: 'test1', name: 'TEST_1' },
    { type: 'user', text: 'test2', name: 'TEST_2' },
    { type: 'user', text: 'test3', name: 'TEST_3' },
    { type: 'user', text: 'test3', name: 'TEST_4' },
];

const topTriggerEventsA = [
    { type: 'user', text: '', name: 'trigger_test_story' },
    { type: 'user', text: 'test1', name: 'TEST_1' },
];
const topTriggerEventsB = [
    { type: 'user', text: 'test1', name: 'TEST_1' },
    { type: 'user', text: '', name: 'trigger_test_story' },
];

describe('analytics cards', () => {
    beforeEach(() => {
        cy.createProject('bf', 'trial', 'en').then(() => {
            cy.login();
            cy.setTimezoneOffset();
        });
    });
    afterEach(() => {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('should display all intents in the table', () => {
        cy.addCustomConversation('bf', 'top10intents', {
            events: top10IntentEvents,
        });
        cy.visit('project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 7);
        cy.dataCy('analytics-card')
            .eq(2)
            .find('rect')
            .filter('[stroke="rgb(29, 111, 168)"]')
            .should('have.length', 10);
        // check that the limit filter does not affect the table

        // check that the limit filter works
        cy.dataCy('card-ellipsis-menu').eq(2).click();
        cy.dataCy('edit-limit').first().click({ force: true });
        cy.dataCy('settings-portal-input').click();
        cy.dataCy('settings-portal-input').find('input').clear().type('5{enter}{esc}');
        cy.dataCy('analytics-card')
            .eq(2)
            .find('rect')
            .filter('[stroke="rgb(29, 111, 168)"]')
            .should('have.length', 5);
        cy.dataCy('table-chart-button').eq(2).click();
        cy.dataCy('analytics-card').eq(2).find('.table').should('exist');
        // check that the least frequently used intent TEST_11 exists
        cy.dataCy('analytics-card').eq(2).find('.rt-td.table-chart-column').should('include.text', 'TEST_11');
        cy.dataCy('bar-chart-button').eq(2).click();
        cy.dataCy('bar-chart-button').eq(2).should('have.class', 'selected');
        // check that a card with an empty limit filter has no limit
        cy.dataCy('card-ellipsis-menu').eq(2).click();
        cy.dataCy('edit-limit').first().click({ force: true });
        cy.dataCy('settings-portal-input').click();
        cy.dataCy('settings-portal-input').find('input').clear().type('{esc}');
        cy.dataCy('analytics-card')
            .eq(2)
            .find('rect')
            .filter('[stroke="rgb(29, 111, 168)"]')
            .should('have.length', 11);
    });
    it('should apply conversation over time filters selected in the ellipsis menu', () => {
        cy.addCustomConversation('bf', 'conversationsOverTime', {
            events: conversationsOverTimeEvents,
        });
        cy.visit('project/bf/analytics');
        // change the length filter to 1 and verify the conversation is excluded
        cy.dataCy('analytics-card').should('have.length', 7);
        cy.dataCy('table-chart-button').first().click();
        cy.dataCy('table-chart-button').first().should('have.class', 'selected');
        cy.dataCy('card-ellipsis-menu').first().click();
        cy.dataCy('edit-conversationLength').first().click({ force: true });
        cy.dataCy('settings-portal-input').click();
        cy.dataCy('settings-portal-input').find('input').clear().type('5`{enter}{esc}');
        cy.dataCy('analytics-card').first().find('.rt-tbody').find('.rt-tr-group')
            .eq(6)
            .find('.rt-td.number-column')
            .first()
            .should('have.text', '0');
        // change the length filter to 4 and verify the conversation is included
        cy.dataCy('card-ellipsis-menu').first().click();
        cy.dataCy('edit-conversationLength').first().click({ force: true });
        cy.dataCy('settings-portal-input').click();
        cy.dataCy('settings-portal-input').find('input').clear().type('4`{enter}{esc}');
        cy.dataCy('analytics-card').first().find('.rt-tbody').find('.rt-tr-group')
            .eq(6)
            .find('.rt-td.number-column')
            .first()
            .should('have.text', '1');
    });
    it('should display a trigger intent card and filter by intent type', () => {
        cy.createCustomStoryGroup('bf', 'test_group_A', 'group A');
        cy.createCustomStory('bf', 'test_group_A', 'test_story', {
            triggerIntent: 'trigger_test_story',
            rules: [{
                payload: '/trigger_test_story',
                trigger: {
                    when: 'always',
                    numberOfVisits: 1,
                },
            }],
        });
        cy.addCustomConversation('bf', 'trigger_intents_A', { events: topTriggerEventsA });
        cy.addCustomConversation('bf', 'trigger_intents_B', { events: topTriggerEventsB });
        cy.visit('project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 7);
        cy.dataCy('create-card').click();
        cy.dataCy('create-card').find('div.item').eq(3).click();
        cy.dataCy('analytics-card').should('have.length', 8);
        // only display trigger intents in top triggers
        cy.dataCy('analytics-card')
            .first()
            .find('rect')
            .filter('[stroke="rgb(29, 111, 168)"]')
            .should('have.length', 1);
        cy.dataCy('table-chart-button').first().click();
        // check trigger intents are named after the corresponding story
        cy.get('.rt-td').contains('test_story').should('exist');
        // trigger intent should not appear in top 10 intents
        cy.dataCy('analytics-card')
            .eq(3)
            .find('rect')
            .filter('[stroke="rgb(29, 111, 168)"]')
            .should('have.length', 1);
        // conversations over time should be able to exclude triggers
        cy.dataCy('table-chart-button').eq(1).click();
        cy.dataCy('table-chart-button').should('have.class', 'selected');
        cy.dataCy('analytics-card').eq(1).find('.rt-tbody').find('.rt-tr-group')
            .eq(6)
            .find('.rt-td.number-column')
            .first()
            .should('have.text', '2');
        cy.dataCy('card-ellipsis-menu').eq(1).click();
        cy.dataCy('edit-userInitiatedConversations').eq(0).click({ force: true }); // it is the second card but the first card with the exclude triggers option
        cy.dataCy('analytics-card').eq(1).find('.rt-tbody').find('.rt-tr-group')
            .eq(6)
            .find('.rt-td.number-column')
            .first()
            .should('have.text', '1');
        cy.dataCy('edit-triggerConversations').eq(0).click({ force: true }); // it is the second card but the first card with the exclude triggers option
        cy.dataCy('analytics-card').eq(1).find('.ui.yellow.message').should('exist');
    });
});
