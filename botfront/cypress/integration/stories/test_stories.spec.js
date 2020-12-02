
/* global cy:true */
describe('adding test cases', () => {
    beforeEach(() => {
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login());
        cy.visit('/project/bf/dialogue');
        cy.createStoryGroup();
        cy.createFragmentInGroup();
        cy.browseToStory();
        cy.addUtteranceLine({ intent: 'shopping' });
        cy.import('bf', 'nlu_import.json', 'en');
        cy.train();
    });
    afterEach(() => {
        cy.deleteProject('bf');
        cy.logout();
    });

    it('should have a conversation and save it as a test case', () => {
        cy.visit('/project/bf/dialogue');

        cy.dataCy('open-chat');
        cy.newChatSesh();
        cy.typeChatMessage('c\'est moi Matthieu');
        cy.wait(1111);
        // save test story from chat
        cy.dataCy('save-chat-as-test').click();
        // we check that the story is here.
        cy.dataCy('story-menu-item-test_case').should('have.length', 1);
        cy.dataCy('story-menu-item-test_case').click();
        cy.dataCy('single-story-editor').contains('c\'est moi');
        cy.dataCy('entity-text').contains('Matthieu');
        // save test story from conversations
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations')
            .click();
        cy.dataCy('conversation-item').should('have.length', 1);
        cy.dataCy('conversation-item').first().click({ force: true });
        cy.dataCy('save-as-test').click();
        // we check that the story is here.
        cy.visit('/project/bf/dialogue');
        cy.dataCy('story-menu-item-test_case').should('have.length', 2);
        cy.dataCy('story-menu-item-test_case').first().click();
        cy.dataCy('single-story-editor').contains('c\'est moi');
        cy.dataCy('entity-text').contains('Matthieu');
    });
});
