/* eslint-disable no-undef */

describe('filters', function () {
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
    
    it('should keep the filter state between hide and reveal', function () {
        cy.visit('/project/bf/incoming');
        cy.dataCy('incoming-conversations-tab')
            .click();
        cy.wait(100);
        cy.dataCy('toggle-filters')
            .click();
        cy.get('.accordion.ui > .content').should('not.have.class', 'active');
        cy.dataCy('toggle-filters')
            .click();
        cy.get('.accordion.ui > .content').should('have.class', 'active');
        cy.dataCy('length-filter')
            .find('input')
            .type('5');
        cy.dataCy('confidence-filter')
            .find('input')
            .type('75');
        cy.dataCy('action-filter')
            .find('.filter-dropdown')
            .click('topLeft')
            .find('input')
            .type('test{enter}');
        cy.dataCy('toggle-filters')
            .click();
        cy.get('.accordion.ui > .content').should('not.have.class', 'active');
        cy.dataCy('toggle-filters').click();
        cy.get('.accordion.ui > .content').should('have.class', 'active');
        cy.dataCy('length-filter').find('input').should('have.value', '5');
        cy.dataCy('confidence-filter').find('input').should('have.value', '75');
        cy.get('[data-cy=action-filter] > .segment > .fluid > .label').should('have.text', 'test');
    });
    
    it('should be resetable', function () {
        cy.visit('/project/bf/incoming');
        cy.dataCy('incoming-conversations-tab')
            .click();
        cy.wait(100);
        cy.get('.accordion.ui > .content').should('have.class', 'active');
        cy.dataCy('length-filter')
            .find('input')
            .type('5');
        cy.dataCy('confidence-filter')
            .find('input')
            .type('75');
        cy.dataCy('action-filter')
            .find('.filter-dropdown')
            .click('topLeft')
            .find('input')
            .type('test{enter}');
        cy.dataCy('reset-filters').click();
        cy.dataCy('length-filter').find('input').should('have.value', '');
        cy.dataCy('confidence-filter').find('input').should('have.value', '');
        cy.get('[data-cy=action-filter] > .segment > .fluid > .label').should('not.exist');
    });
    
    it('should filter by length', function () {
        cy.fixture('botfront_conversations_project.json', 'utf8').then((conversationData) => {
            cy.addConversation('bf', 'len3', conversationData.len_3);
            cy.addConversation('bf', 'len1', conversationData.len_1);
            cy.visit('/project/bf/incoming');
            cy.dataCy('incoming-conversations-tab')
                .click();
            cy.wait(100);
            cy.dataCy('length-filter')
                .find('input')
                .type('2{enter}');
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('conversation-item').should('have.text', 'len3');
            cy.dataCy('conversation-item').should('not.have.text', 'len1');
            cy.dataCy('length-filter')
                .find('.filter-dropdown')
                .click()
                .find('div')
                .contains('Less than')
                .click();
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('conversation-item').should('have.text', 'len1');
            cy.dataCy('conversation-item').should('not.have.text', 'len3');
            cy.dataCy('length-filter')
                .find('input')
                .clear();
            cy.dataCy('length-filter')
                .find('input')
                .type('3');
            cy.dataCy('length-filter')
                .find('.filter-dropdown')
                .click()
                .find('div')
                .contains('Equals')
                .click();
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('conversation-item').should('have.text', 'len3');
            cy.dataCy('conversation-item').should('not.have.text', 'len1');
            cy.dataCy('length-filter')
                .find('input')
                .type('33');
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('no-conv').should('contains.text', 'No conversation to load');
        });
    });
    
    
    it('should filter by confidence', function () {
        cy.fixture('botfront_conversations_project.json', 'utf8').then((conversationData) => {
            cy.addConversation('bf', 'conf90', conversationData.conf_90);
            cy.addConversation('bf', 'conf70', conversationData.conf_70);
            cy.visit('/project/bf/incoming');
            cy.dataCy('incoming-conversations-tab')
                .click();
            cy.dataCy('confidence-filter')
                .find('input')
                .type('75');
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('conversation-item').should('have.text', 'conf70');
            cy.dataCy('conversation-item').should('not.have.text', 'conf90');
        });
    });
    
    
    it('should filter by action', function () {
        cy.fixture('botfront_conversations_project.json', 'utf8').then((conversationData) => {
            cy.addConversation('bf', 'test', conversationData.action_test);
            cy.addConversation('bf', 'autre', conversationData.action_autre);
            cy.visit('/project/bf/incoming');
            cy.dataCy('incoming-conversations-tab')
                .click();
            cy.dataCy('action-filter')
                .find('.filter-dropdown')
                .click()
                .find('input')
                .type('action_test{enter}');
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('conversation-item').should('have.text', 'test');
            cy.dataCy('conversation-item').should('not.have.text', 'autre');
            cy.dataCy('action-filter')
                .click()
                .find('.label')
                .contains('action_test')
                .find('.icon')
                .click();
            cy.dataCy('action-filter')
                .find('.filter-dropdown')
                .click('topLeft')
                .find('input')
                .type('action_autre{enter}');
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('conversation-item').should('have.text', 'autre');
            cy.dataCy('conversation-item').should('not.have.text', 'test');
        });
    });
    
    it('should filter be possible to filter with multiple constraints at once', function () {
        cy.fixture('botfront_conversations_project.json', 'utf8').then((conversationData) => {
            cy.addConversation('bf', 'test', conversationData.action_test);
            cy.addConversation('bf', 'autre', conversationData.action_autre);
            cy.addConversation('bf', 'conf90', conversationData.conf_90);
            cy.addConversation('bf', 'conf70', conversationData.conf_70);
            cy.addConversation('bf', 'len3', conversationData.len_3);
            cy.addConversation('bf', 'len1', conversationData.len_1);
            cy.addConversation('bf', 'pass_all', conversationData.len_3_conf_70_action_test);

            cy.visit('/project/bf/incoming');
            cy.dataCy('incoming-conversations-tab')
                .click();
            cy.dataCy('action-filter')
                .find('.filter-dropdown')
                .click()
                .find('input')
                .type('action_test{enter}');
            cy.dataCy('confidence-filter')
                .find('input')
                .type('75');
            cy.dataCy('length-filter')
                .find('input')
                .type('2{enter}');
            cy.dataCy('apply-filters').click();
            cy.dataCy('conversation-item').should('have.text', 'pass_all');
        });
    });
});
