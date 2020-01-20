/* eslint-disable no-undef */

describe('Smart story trigger rules', function() {
    afterEach(function() {
        cy.deleteProject('bf');
        cy.logout();
    });

    beforeEach(function() {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login());
    });
    it('should edit and save the trigger rules', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('edit-trigger-rules').click();
        // add two rulesets
        cy.dataCy('story-rules-editor').find('.add.icon').click();
        cy.dataCy('story-rules-editor').find('.add.icon').click();
        // edit the first ruleset
        cy.dataCy('toggle-payload-text').first().click();
        cy.dataCy('payload-text-input').first().click().find('input')
            .type('test payload');
        cy.dataCy('toggle-website-visits').first().click();
        cy.dataCy('website-visits-input').first().click().find('input')
            .type('3');
        // edit the second ruleset
        cy.dataCy('toggle-page-visits').last().click();
        cy.dataCy('page-visits-input').last().click().find('input')
            .type('4');
        cy.dataCy('toggle-query-string').last().click();
        cy.dataCy('query-string-field').last().find('.add.icon').click();
        cy.dataCy('query-string-field').last().find('input').first()
            .click()
            .type('name');
        cy.dataCy('query-string-field').last().find('input').last()
            .click()
            .type('value');
        // close the trigger rules editor
        cy.get('.dimmer').click({ position: 'topLeft' });
        cy.get('.dimmer').should('not.exist');
        cy.reload();
        // open the trigger
        cy.dataCy('edit-trigger-rules').should('have.class', 'green');
        cy.dataCy('edit-trigger-rules').click();
        // verify trigger rules were saved
        cy.dataCy('payload-text-input').find('input').should('have.value', 'test payload');
        cy.dataCy('website-visits-input').find('input').should('have.value', '3');
        cy.dataCy('page-visits-input').find('input').should('have.value', '4');
        cy.dataCy('query-string-field').find('input').first().should('have.value', 'name');
        cy.dataCy('query-string-field').find('input').last().should('have.value', 'value');
    });
    it('should clear disabled fields on close', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('edit-trigger-rules').click();
        // add two rulesets
        cy.dataCy('story-rules-editor').find('.add.icon').click();
        // edit the first ruleset
        cy.dataCy('toggle-payload-text').click();
        cy.dataCy('payload-text-input').click().find('input')
            .type('test payload');
        cy.dataCy('toggle-website-visits').click();
        cy.dataCy('website-visits-input').click().find('input')
            .type('3');
        // close the trigger rules editor
        cy.get('.dimmer').click({ position: 'topLeft' });
        cy.get('.dimmer').should('not.exist');
        cy.reload();
        // reopen the trigger rules editor
        cy.dataCy('edit-trigger-rules').click();
        // verify trigger rules were saved
        cy.dataCy('payload-text-input').find('input').should('have.value', 'test payload');
        cy.dataCy('toggle-payload-text').click();
        // close the trigger rules editor
        cy.get('.dimmer').click({ position: 'topLeft' });
        cy.get('.dimmer').should('not.exist');
        cy.reload();
        // reopen the trigger rules editor
        cy.dataCy('edit-trigger-rules').click();
        cy.dataCy('toggle-payload-text').click();
        cy.dataCy('payload-text-input').find('input').should('have.value', '');
    });
    it('should disabled time on page when event listeners are enabled', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('edit-trigger-rules').click();
        // add two rulesets
        cy.dataCy('story-rules-editor').find('.add.icon').click();
        // edit the first ruleset
        cy.dataCy('toggle-time-on-page').click();
        cy.dataCy('toggle-event-listeners').click();
        cy.dataCy('toggle-time-on-page').find('[data-cy=toggled-false]').should('exist');
        cy.dataCy('toggle-event-listeners').find('[data-cy=toggled-true]').should('exist');
        cy.dataCy('toggle-time-on-page').click();
        cy.dataCy('toggle-time-on-page').find('[data-cy=toggled-true]').should('exist');
        cy.dataCy('toggle-event-listeners').find('[data-cy=toggled-false]').should('exist');
    });
    it('should disabled event listeners when time on page is enabled', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('edit-trigger-rules').click();
        cy.dataCy('story-rules-editor').find('.add.icon').click();
        // verify only one toggle can be enabled at one time
        cy.dataCy('toggle-event-listeners').click();
        cy.dataCy('toggle-time-on-page').click();
        cy.dataCy('toggle-event-listeners').find('[data-cy=toggled-false]').should('exist');
        cy.dataCy('toggle-time-on-page').find('[data-cy=toggled-true]').should('exist');
        cy.dataCy('toggle-event-listeners').click();
        cy.dataCy('toggle-event-listeners').find('[data-cy=toggled-true]').should('exist');
        cy.dataCy('toggle-time-on-page').find('[data-cy=toggled-false]').should('exist');
    });
    it('should not allow a destination story to have rules', () => {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type('myTest{enter}');
        cy.dataCy('story-title').should('have.value', 'myTest');

        // add story
        cy.dataCy('add-story').click();
        cy.dataCy('single-story-editor').should('have.length', 2);
        // link the new story to the first story
        cy.dataCy('stories-linker').last().click();
        cy.dataCy('link-to').last().find('span').contains('myTest')
            .click({ force: true });
        cy.dataCy('connected-to').should('exist');

        cy.dataCy('edit-trigger-rules').first().should('have.class', 'disabled');
        cy.dataCy('edit-trigger-rules').first().click();
        cy.dataCy('story-rules-editor').should('not.exist');
    });
    it('should not allow linking to a story with rules', () => {
        cy.visit('/project/bf/stories');
        // add a story group
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input')
            .find('input')
            .type('myTest{enter}');
        cy.dataCy('story-title').should('have.value', 'myTest');
        // add rules to the first story
        cy.dataCy('edit-trigger-rules').click();
        cy.dataCy('story-rules-editor').find('.add.icon').click();
        cy.dataCy('toggle-payload-text').first().click();
        cy.dataCy('payload-text-input').first().click().find('input')
            .type('test payload');
        cy.dataCy('toggle-website-visits').first().click();
        cy.dataCy('website-visits-input').first().click().find('input')
            .type('3');
        cy.get('.dimmer').click({ position: 'topLeft' });
        cy.get('.dimmer').should('not.exist');
        // add a new story
        cy.dataCy('add-story').click();
        cy.dataCy('single-story-editor').should('have.length', 2);
        // try to link the new story to the first story
        cy.dataCy('stories-linker').last().click();
        cy.dataCy('link-to').last().find('span').contains('myTest')
            .should('not.exist');
    });
    it('should trigger a story with the rules payload', () => {
        cy.MeteorCallAdmin('storyGroups.insert', [
            {
                _id: 'RULES',
                name: 'Test Group',
                projectId: 'bf',
            },
        ]);
        cy.MeteorCallAdmin('stories.insert', [
            {
                _id: 'TESTSTORY',
                projectId: 'bf',
                storyGroupId: 'RULES',
                story: '  - utter_smart_payload',
                title: 'Test Story',
            },
        ]);
        cy.logout();
        cy.login();
        cy.visit('/project/bf/stories');
        cy.dataCy('browser-item').contains('Test Group').click();
        cy.dataCy('story-title').should('have.value', 'Test Story');
        // add rules to the first story
        cy.dataCy('edit-trigger-rules').click();
        cy.dataCy('story-rules-editor').find('.add.icon').click();
        cy.dataCy('toggle-payload-text').first().click();
        cy.dataCy('payload-text-input').first().click().find('input')
            .type('test payload');
        cy.dataCy('toggle-website-visits').first().click();
        cy.dataCy('website-visits-input').first().click().find('input')
            .type('3');
        cy.get('.dimmer').click({ position: 'topLeft' });
        cy.get('.dimmer').should('not.exist');
        cy.train();
        cy.dataCy('open-chat').click();
        cy.newChatSesh('en');
        cy.testChatInput('/payload_TESTSTORY', 'utter_smart_payload'); // nlg returns template name if not defined
    });
});
