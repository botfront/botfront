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
        cy.addConversationFromTemplate('bf', 'len_3', 'len3');
        cy.addConversationFromTemplate('bf', 'len_1', 'len1');
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
        cy.reload();
        cy.dataCy('conversation-item').should('have.text', 'len3');
        cy.dataCy('conversation-item').should('not.have.text', 'len1');
        cy.dataCy('length-filter')
            .find('input')
            .type('33');
        cy.dataCy('apply-filters').click();
        cy.wait(100);
        cy.dataCy('no-conv').should('exist');
    });
    
    it('should filter by confidence', function () {
        cy.addConversationFromTemplate('bf', 'conf_70', 'conf70');
        cy.addConversationFromTemplate('bf', 'conf_90', 'conf90');
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
        cy.reload();
        cy.dataCy('conversation-item').should('have.text', 'conf70');
        cy.dataCy('conversation-item').should('not.have.text', 'conf90');
    });
    
    it('should filter by action', function () {
        // both conversation that have been added also gave an action_dummy
        cy.addConversationFromTemplate('bf', 'action_test', 'test');
        cy.addConversationFromTemplate('bf', 'action_autre', 'autre');
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
        cy.reload();
        cy.dataCy('conversation-item').should('have.text', 'autre');
        cy.dataCy('conversation-item').should('not.have.text', 'test');
    });
    it('should filter by intent', function () {
        // both conversation that have been added also gave an intent_dummy
        cy.addConversationFromTemplate('bf', 'intent_test', 'test');
        cy.addConversationFromTemplate('bf', 'intent_autre', 'autre');
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
        cy.reload();
        cy.dataCy('conversation-item').should('have.text', 'autre');
        cy.dataCy('conversation-item').should('not.have.text', 'test');
    });

    it('should filter by date', function () {
        // cy.importProject('bf', 'filter_by_date_data.json');
        cy.addConversationFromTemplate('bf', 'default', 'oct', { startTime: 1571097600 }); // 15th October 2019
        cy.addConversationFromTemplate('bf', 'default', 'nov', { startTime: 1573776000 }); // 15th November 2019
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations')
            .click();
        cy.pickDateRange(0, '1/10/2019', '30/11/2019');
        cy.dataCy('apply-filters').click();
        cy.dataCy('conversation-item').should('have.length', 2);
        cy.pickDateRange(0, '1/11/2019', '30/11/2019');
        cy.dataCy('apply-filters').click();
        cy.wait(100);
        cy.dataCy('conversation-item').should('have.text', 'nov');
        cy.dataCy('conversation-item').should('have.length', 1);
        cy.reload();
        cy.dataCy('conversations').should('exist');
        cy.dataCy('conversation-item').should('have.text', 'nov');
        cy.dataCy('conversation-item').should('have.length', 1);
    });

    it('should filter by userId', function () {
        cy.addConversationFromTemplate('bf', 'uid_aaa', 'uidaaa');
        cy.addConversationFromTemplate('bf', 'uid_bbb', 'uidbbb');
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
        cy.reload();
        cy.dataCy('conversation-item').should('have.text', 'uidaaa');
        cy.dataCy('conversation-item').should('not.have.text', 'uidbbb');
    });
    it('should filter by duration', function () {
        cy.addConversationFromTemplate('bf', 'default', 'duration10', { duration: 10 });
        cy.addConversationFromTemplate('bf', 'default', 'duration20', { duration: 20 });
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations')
            .click();
        cy.dataCy('duration-filter-from')
            .find('input')
            .type('15');
        cy.dataCy('duration-filter-to')
            .find('input')
            .type('25');
        cy.dataCy('apply-filters').click();
        cy.wait(100);
        cy.dataCy('conversation-item').should('have.text', 'duration20');
        cy.dataCy('conversation-item').should('have.length', 1);
        cy.dataCy('duration-filter-to')
            .find('input')
            .clear()
            .type('15');
        cy.dataCy('duration-filter-from')
            .find('input')
            .clear();
        cy.dataCy('apply-filters').click();
        cy.reload();
        cy.dataCy('conversation-item').should('have.text', 'duration10');
        cy.dataCy('conversation-item').should('have.length', 1);
        cy.dataCy('duration-filter-to')
            .find('input')
            .clear();
        cy.dataCy('duration-filter-from')
            .find('input')
            .clear()
            .type('15');
        cy.dataCy('apply-filters').click();
        cy.reload();
        cy.dataCy('conversation-item').should('have.text', 'duration20');
        cy.dataCy('conversation-item').should('have.length', 1);
    });
    
    it('should filter be possible to filter with multiple constraints at once', function () {
        cy.addConversationFromTemplate('bf', 'action_test', 'test');
        cy.addConversationFromTemplate('bf', 'action_autre', 'autre');
        cy.addConversationFromTemplate('bf', 'conf_90', 'conf90');
        cy.addConversationFromTemplate('bf', 'conf_70', 'conf70');
        cy.addConversationFromTemplate('bf', 'len_3', 'len3');
        cy.addConversationFromTemplate('bf', 'len_1', 'len1');
        cy.addConversationFromTemplate('bf', 'len_1', 'len1');
        cy.addConversationFromTemplate('bf', 'len_3_conf_70_action_test', 'pass_all');

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

    it('should filter by a single user after clicking on a userId in the conversation viewer', () => {
        cy.addConversationFromTemplate('bf', 'uid_aaa', 'uidaaa');
        cy.addConversationFromTemplate('bf', 'uid_bbb', 'uidbbb');
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
    it('should persist filters after a page refresh', () => {
        cy.addConversationFromTemplate('bf', 'intent_test', 'test');
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations').click();
        cy.dataCy('id-filter').find('input').type('test');
        cy.pickDateRange(0, '1/10/2019', '30/11/2019');
        cy.dataCy('duration-filter-to').find('input').type('10');
        cy.dataCy('length-filter').find('input').type('2');
        cy.dataCy('length-filter').find('.filter-dropdown').click();
        cy.dataCy('length-filter').find('span.text').contains('≤').click();
        cy.dataCy('confidence-filter').find('input').type('50');
        cy.dataCy('action-filter')
            .find('.filter-dropdown')
            .click()
            .find('input')
            .type('action_dummy{enter}{esc}');
        cy.dataCy('action-filter')
            .find('.andor')
            .click()
            .find('div')
            .contains('And')
            .click();
        cy.dataCy('intent-filter')
            .find('.filter-dropdown')
            .click()
            .find('input')
            .type('intent_dummy{enter}{esc}');
        cy.dataCy('intent-filter')
            .find('.andor')
            .click()
            .find('div')
            .contains('And')
            .click();
        cy.dataCy('apply-filters').click();

        cy.reload();
        // wait for the page to load so the filters are added to redux
        cy.dataCy('id-filter').find('input').should('have.value', 'test');
        // navigate away from the page and back to check that the filters can be laoded from redux
        cy.dataCy('stories-sidebar-link').click({ force: true });
        cy.dataCy('story-group-menu-item').should('exist');
        cy.dataCy('incoming-sidebar-link').click({ force: true });
        cy.dataCy('conversations').click();
        // check the filters kept their values
        cy.dataCy('id-filter').find('input').should('have.value', 'test');
        cy.dataCy('date-picker-container').find('.button').contains('01/10/2019 - 30/11/2019').should('exist');
        cy.dataCy('duration-filter-to').find('input').should('have.value', '10');
        cy.dataCy('length-filter').find('input').should('have.value', '2');
        cy.dataCy('length-filter').find('div.text').should('have.text', '≤');
        cy.dataCy('confidence-filter').find('input').should('have.value', '50');
        cy.dataCy('intent-filter').find('.ui.label').contains('intent_dummy').should('exist');
        cy.dataCy('intent-filter').find('div.text').should('have.text', 'And');
        cy.dataCy('action-filter').find('.ui.label').contains('action_dummy').should('exist');
        cy.dataCy('action-filter').find('div.text').should('have.text', 'And');
    });
});
