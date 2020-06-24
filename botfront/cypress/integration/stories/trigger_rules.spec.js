/* global cy */

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
        cy.browseToStory('Get started');
        cy.get('.utterances-container').first().findCy('icon-trash').click({ force: true });
        cy.dataCy('edit-trigger-rules').click();
        // add a second rulesets
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
        cy.dataCy('query-string-field').last().find('input').first()
            .click()
            .type('name');
        cy.dataCy('query-string-field').last().find('input').eq(1)
            .click()
            .type('value');
        // close the trigger rules editor
        cy.dataCy('submit-triggers').click();
        cy.get('.dimmer').should('not.exist');
        // open the trigger editor
        cy.dataCy('edit-trigger-rules').should('have.class', 'green');
        cy.dataCy('edit-trigger-rules').click();
        // verify trigger rules were saved
        cy.dataCy('payload-text-input').find('input').should('have.value', 'test payload');
        cy.dataCy('website-visits-input').find('input').should('have.value', '3');
        cy.dataCy('page-visits-input').find('input').should('have.value', '4');
        cy.dataCy('query-string-field').find('input').first().should('have.value', 'name');
        cy.dataCy('query-string-field').find('input').eq(1).should('have.value', 'value');
    });

    it('should delete trigger rules with the delete button', () => {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Get started');
        cy.dataCy('edit-trigger-rules').click();
        // add trigger rules
        cy.dataCy('toggle-payload-text').first().click();
        cy.dataCy('payload-text-input').first().click().find('input')
            .type('test payload');
        cy.dataCy('toggle-website-visits').first().click();
        cy.dataCy('website-visits-input').first().click().find('input')
            .type('3');
        // close the trigger rules editor
        cy.dataCy('submit-triggers').click();
        cy.get('.dimmer').should('not.exist');
        // open the trigger
        cy.dataCy('edit-trigger-rules').should('have.class', 'green');
        cy.dataCy('edit-trigger-rules').click();
        // verify trigger rules were deleted
        cy.dataCy('delete-triggers').click();
        cy.get('.dimmer').should('not.exist');
        cy.dataCy('edit-trigger-rules').click();
        cy.dataCy('toggle-payload-text').find('[data-cy=toggled-]').should('exist');
        cy.dataCy('toggle-website-visits').find('[data-cy=toggled-]').should('exist');
    });
    
    it('should clear disabled fields on close', function() {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Get started');
        cy.get('.utterances-container').first().findCy('icon-trash').click({ force: true });
        cy.dataCy('edit-trigger-rules').click();
        // edit the trigger rules
        cy.dataCy('toggle-payload-text').click();
        cy.dataCy('payload-text-input').click().find('input')
            .type('test payload');
        cy.dataCy('toggle-website-visits').click();
        cy.dataCy('website-visits-input').click().find('input')
            .type('3');
        // close the trigger rules editor
        cy.dataCy('submit-triggers').click();
        cy.get('.dimmer').should('not.exist');
        // reopen the trigger rules editor
        cy.dataCy('edit-trigger-rules').click();
        // verify trigger rules were saved
        cy.dataCy('payload-text-input').find('input').should('have.value', 'test payload');
        cy.dataCy('toggle-payload-text').click();
        cy.dataCy('toggle-payload-text').find('[data-cy=toggled-false]').should('exist');
        // close the trigger rules editor
        cy.dataCy('submit-triggers').click();
        cy.get('.dimmer').should('not.exist');
        // reopen the trigger rules editor
        cy.dataCy('edit-trigger-rules').click();
        cy.dataCy('toggle-payload-text').click();
        cy.dataCy('toggle-payload-text').find('[data-cy=toggled-true]').should('exist');
        cy.dataCy('payload-text-input').find('input').should('have.value', '');
    });

    it('should not allow a destination story to have rules', () => {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Get started');
        cy.createStoryInGroup({ groupName: 'Default stories', storyName: 'like woah' });
        cy.linkStory('like woah', 'Get started');
        cy.browseToStory('Get started');
        cy.dataCy('connected-to').should('exist');
        cy.dataCy('edit-trigger-rules').first().should('have.class', 'disabled');
        cy.dataCy('edit-trigger-rules').first().click();
        cy.dataCy('story-rules-editor').should('not.exist');
    });

    it('should not allow linking to a story with rules', () => {
        cy.visit('/project/bf/stories');
        // add rules to the first story
        cy.browseToStory('Get started');
        cy.dataCy('edit-trigger-rules').click();
        cy.dataCy('toggle-payload-text').first().click();
        cy.dataCy('payload-text-input').first().click().find('input')
            .type('test payload');
        cy.dataCy('toggle-website-visits').first().click();
        cy.dataCy('website-visits-input').first().click().find('input')
            .type('3');
        cy.dataCy('submit-triggers').click();
        cy.get('.dimmer').should('not.exist');
        // add a new story
        cy.createStoryInGroup({ groupName: 'Default stories', storyName: 'like woah' });
        // try to link the new story to the first story
        cy.dataCy('stories-linker').last().click();
        cy.dataCy('link-to').last().find('span').contains('Get started')
            .should('not.exist');
    });

    it('should trigger a story with the rules payload', () => {
        cy.MeteorCall('storyGroups.insert', [
            {
                _id: 'RULES',
                name: 'Test Group',
                projectId: 'bf',
            },
        ]);
        cy.MeteorCall('stories.insert', [
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
        cy.browseToStory('Test Story');
        // add trigger rules to the story
        cy.dataCy('edit-trigger-rules').click();
        cy.dataCy('toggle-payload-text').first().click();
        cy.dataCy('payload-text-input').first().click().find('input')
            .type('test payload');
        cy.dataCy('toggle-website-visits').first().click();
        cy.dataCy('website-visits-input').first().click().find('input')
            .type('3');
        cy.dataCy('submit-triggers').click();
        cy.get('.dimmer').should('not.exist');
        // verify the story is triggered by the payload '/trigger_storyId'
        cy.train();
        cy.dataCy('open-chat').click();
        cy.newChatSesh('en');
        cy.testChatInput('/trigger_TESTSTORY', 'utter_smart_payload'); // nlg returns template name if not defined
    });
});
