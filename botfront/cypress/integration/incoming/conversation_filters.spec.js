/* eslint-disable no-undef */

describe('filters', function () {
    beforeEach(function () {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
            cy.setTimezoneOffset();
        });
    });

    afterEach(function () {
        cy.logout();
    });
    
    it('should keep the filter state between hide and reveal', function () {
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations')
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
            .click()
            .find('input')
            .type('test{enter}{esc}');
        cy.dataCy('toggle-filters')
            .click();
        cy.get('.accordion.ui > .content').should('not.have.class', 'active');
        cy.dataCy('toggle-filters').click();
        cy.get('.accordion.ui > .content').should('have.class', 'active');
        cy.dataCy('length-filter').find('input').should('have.value', '5');
        cy.dataCy('confidence-filter').find('input').should('have.value', '75');
        cy.get('.fluid > .ui').should('have.text', 'test');
    });
    
    it('should be resetable', function () {
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations')
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
            .click()
            .find('input')
            .type('test{enter}{esc}');
        cy.dataCy('reset-filter').click();
        cy.dataCy('length-filter').find('input').should('have.value', '');
        cy.dataCy('confidence-filter').find('input').should('have.value', '');
        cy.get('[data-cy=action-filter] > .segment > .fluid > .label').should('not.exist');
    });
    
    it('should filter by length', function () {
        cy.fixture('botfront_conversations_project.json', 'utf8').then((conversationData) => {
            cy.addConversation('bf', 'len3', conversationData.len_3);
            cy.addConversation('bf', 'len1', conversationData.len_1);
            cy.visit('/project/bf/incoming');
            cy.dataCy('conversations')
                .click();
            cy.wait(100);
            cy.dataCy('length-filter')
                .find('input')
                .type('2{enter}{esc}');
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('conversation-item').should('have.text', 'len3');
            cy.dataCy('conversation-item').should('not.have.text', 'len1');
            cy.dataCy('length-filter')
                .find('.filter-dropdown')
                .click()
                .find('div')
                .contains('≤')
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
                .contains('=')
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
            cy.dataCy('no-conv').should('exist');
        });
    });
    
    it('should filter by confidence', function () {
        cy.fixture('botfront_conversations_project.json', 'utf8').then((conversationData) => {
            cy.addConversation('bf', 'conf90', conversationData.conf_90);
            cy.addConversation('bf', 'conf70', conversationData.conf_70);
            cy.visit('/project/bf/incoming');
            cy.dataCy('conversations')
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
            // both conversation that have been added also gave an action_dummy
            cy.addConversation('bf', 'test', conversationData.action_test);
            cy.addConversation('bf', 'autre', conversationData.action_autre);
            cy.updateConversation('bf', 'test', conversationData.action_test);
            cy.updateConversation('bf', 'autre', conversationData.action_autre);
            cy.visit('/project/bf/incoming');
            cy.dataCy('conversations')
                .click();
            cy.dataCy('action-filter')
                .find('.filter-dropdown')
                .click()
                .find('input')
                .type('action_test{enter}{esc}');
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
                .click()
                .find('input')
                .type('action_autre{enter}{esc}');
            cy.dataCy('action-filter')
                .find('.filter-dropdown')
                .click()
                .find('input')
                .type('action_dummy{enter}{esc}');
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('conversation-item').should('have.text', 'autretest');
            cy.dataCy('action-filter')
                .find('.andor')
                .click()
                .find('div')
                .contains('And')
                .click();
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('conversation-item').should('have.text', 'autre');
            cy.dataCy('conversation-item').should('not.have.text', 'test');
        });
    });
    it('should filter by intent', function () {
        cy.fixture('botfront_conversations_project.json', 'utf8').then((conversationData) => {
            // both conversation that have been added also gave an intent_dummy
            cy.addConversation('bf', 'test', conversationData.intent_test);
            cy.addConversation('bf', 'autre', conversationData.intent_autre);
            cy.updateConversation('bf', 'test', conversationData.intent_test);
            cy.updateConversation('bf', 'autre', conversationData.intent_autre);
            cy.visit('/project/bf/incoming');
            cy.dataCy('conversations')
                .click();
            cy.dataCy('intent-filter')
                .find('.filter-dropdown')
                .click()
                .find('input')
                .type('intent_test{enter}{esc}');
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('conversation-item').should('have.text', 'test');
            cy.dataCy('conversation-item').should('not.have.text', 'autre');
            cy.dataCy('intent-filter')
                .click()
                .find('.label')
                .contains('intent_test')
                .find('.icon')
                .click();
            cy.dataCy('intent-filter')
                .find('.filter-dropdown')
                .click()
                .find('input')
                .type('intent_autre{enter}{esc}');
            cy.dataCy('intent-filter')
                .find('.filter-dropdown')
                .click()
                .find('input')
                .type('intent_dummy{enter}{esc}');
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('conversation-item').should('have.text', 'autretest');
            cy.dataCy('intent-filter')
                .find('.andor')
                .click()
                .find('div')
                .contains('And')
                .click();
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('conversation-item').should('have.text', 'autre');
            cy.dataCy('conversation-item').should('not.have.text', 'test');
        });
    });

    it('should filter by date', function () {
        cy.importProject('bf', 'filter_by_date_data.json');
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations')
            .click();
        
        cy.pickDateRange(0, '1/10/2019', '30/11/2019');
        cy.dataCy('apply-filters').click();
        cy.dataCy('utterance-text').should('contains.text', 'nov');
        cy.dataCy('conversation-item').eq(1).click();
        cy.dataCy('utterance-text').should('contains.text', 'oct');
        cy.pickDateRange(0, '1/11/2019', '30/11/2019');
        cy.dataCy('apply-filters').click();
        cy.wait(100);
        cy.dataCy('utterance-text').should('contains.text', 'nov');
        cy.dataCy('conversation-item').should('have.length', 1);
    });

    it('should filter by userId', function () {
        cy.fixture('botfront_conversations_project.json', 'utf8').then((conversationData) => {
            cy.addConversation('bf', 'uidaaa', conversationData.uid_aaa);
            cy.addConversation('bf', 'uidbbb', conversationData.uid_bbb);
            cy.updateConversation('bf', 'uidaaa', conversationData.uid_aaa); // the uid field is only added after the update
            cy.updateConversation('bf', 'uidbbb', conversationData.uid_bbb);
            cy.visit('/project/bf/incoming');
            cy.dataCy('conversations')
                .click();
            cy.dataCy('id-filter')
                .find('input')
                .type('aaa');
                
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('conversation-item').should('have.text', 'uidaaa');
            cy.dataCy('conversation-item').should('not.have.text', 'uidbbb');
        });
    });
    it('should filter by duration', function () {
        cy.fixture('botfront_conversations_project.json', 'utf8').then((conversationData) => {
            cy.addConversation('bf', 'test', conversationData.test_duration);
            cy.visit('/project/bf/incoming');
            cy.dataCy('conversations')
                .click();
            cy.dataCy('duration-filter')
                .find('input')
                .type('1');
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('conversation-item').should('have.length', 1);
            cy.dataCy('duration-filter')
                .find('.dropdown')
                .first()
                .click();
            cy.dataCy('duration-filter').find('span').contains('≤').click();
            cy.dataCy('apply-filters').click();
            cy.wait(100);
            cy.dataCy('no-conv').should('exist');
        });
    });
    
    it('should filter be possible to filter with multiple constraints at once', function () {
        cy.fixture('botfront_conversations_project.json', 'utf8').then((conversationData) => {
            cy.addConversation('bf', 'test', conversationData.action_test);
            cy.addConversation('bf', 'autre', conversationData.action_autre);
            cy.updateConversation('bf', 'test', conversationData.action_test);
            cy.updateConversation('bf', 'autre', conversationData.action_autre);
            cy.addConversation('bf', 'conf90', conversationData.conf_90);
            cy.addConversation('bf', 'conf70', conversationData.conf_70);
            cy.addConversation('bf', 'len3', conversationData.len_3);
            cy.addConversation('bf', 'len1', conversationData.len_1);
            cy.addConversation('bf', 'pass_all', conversationData.len_3_conf_70_action_test);
            cy.updateConversation('bf', 'pass_all', conversationData.len_3_conf_70_action_test);

            cy.visit('/project/bf/incoming');
            cy.dataCy('conversations')
                .click();
            cy.dataCy('action-filter')
                .find('.filter-dropdown')
                .click()
                .find('input')
                .type('action_test{enter}{esc}');
            cy.dataCy('confidence-filter')
                .find('input')
                .type('75');
            cy.dataCy('length-filter')
                .find('input')
                .type('2{enter}{esc}');
            cy.dataCy('apply-filters').click();
            cy.dataCy('conversation-item').should('have.text', 'pass_all');
        });
    });

    it('should filter by a single user after clicking on a userId in the conversation viewer', () => {
        cy.fixture('botfront_conversations_project.json', 'utf8').then((conversationData) => {
            cy.addConversation('bf', 'uidaaa', conversationData.uid_aaa);
            cy.addConversation('bf', 'uidbbb', conversationData.uid_bbb);
            cy.updateConversation('bf', 'uidaaa', conversationData.uid_aaa); // the uid field is only added after the update
            cy.updateConversation('bf', 'uidbbb', conversationData.uid_bbb);
            cy.visit('/project/bf/incoming');
            cy.dataCy('conversations')
                .click();
            cy.dataCy('conversation-item').contains('uidaaa').click();
            cy.dataCy('utterance-author').contains('aaa').click();
            cy.dataCy('filter-by-user-id-modal').find('.ui.primary.button').click();
            cy.dataCy('conversation-item').should('have.length', 1);
            cy.dataCy('conversation-item').should('have.text', 'uidaaa');
            cy.dataCy('conversation-item').should('not.have.text', 'uidbbb');
            cy.dataCy('id-filter').find('input').should('have.value', 'aaa');
        });
    });
});
