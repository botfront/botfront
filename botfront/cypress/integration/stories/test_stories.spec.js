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
    });
    afterEach(() => {
        cy.deleteProject('bf');
        cy.logout();
    });

    it('should have a conversation and save it as a test case', () => {
        cy.visit('/project/bf/dialogue');
        cy.train();

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
        cy.dataCy('conversations').click();
        cy.dataCy('conversation-item').should('have.length', 1);
        cy.dataCy('conversation-item').first().click({ force: true });
        cy.dataCy('save-as-test').click();
        // we check that the story is here.
        cy.visit('/project/bf/dialogue');
        cy.dataCy('story-menu-item-test_case').should('have.length', 2);
        cy.dataCy('story-menu-item-test_case').first().click();
        cy.dataCy('single-story-editor').contains('c\'est moi');
        cy.dataCy('entity-text').contains('Matthieu');

        cy.dataCy('train-and-deploy').click();
        cy.dataCy('run-all-tests').click();

        cy.get('.s-alert-box')
            .contains('Test run complete. 2 tests passing')
            .should('exist');
    });

    it('should display expected vs actual when test results are not the expected result', () => {
        cy.createNLUModelProgramatically('bf', '', 'fr');
        cy.createCustomStoryGroup('bf', 'test_case_group', 'tests');
        cy.createCustomStory('bf', 'test_case_group', 'test_story_en', {
            type: 'test_case',
            title: 'test story en',
            steps: [
                { user: '/get_started', entities: [], intent: 'get_started' },
                { action: 'utter_get_started' },
                {
                    user: 'c\'est moi Matthieu',
                    entities: [],
                    intent: 'chitchat.presentation',
                },
            ],
            language: 'en',
            success: true,
            testResults: [],
        });
        cy.train();

        cy.dataCy('language-selector').click();
        cy.dataCy('language-selector').find('span.text').contains('French').click();

        cy.dataCy('story-menu-item-story-group').should('not.include.text', 'Failing tests');
        cy.dataCy('story-menu-item-test_case').should('not.exist');

        cy.dataCy('train-and-deploy').click();
        cy.dataCy('run-all-tests').click();
        cy.get('.s-alert-box').should('include.text', '0 tests passing, 1 test failing');

        cy.dataCy('story-menu-item-story-group').should('include.text', 'Failing tests');
        cy.dataCy('story-menu-item-test_case').should('exist');

        cy.browseToStory('test story en');
        cy.get('.utterances-container').eq(2).should('have.class', 'theme-actual');
        cy.get('.utterances-container').eq(3).should('have.class', 'theme-expected');

        cy.dataCy('overwrite-test-button').click();
        cy.get('.ui.primary.button').contains('Overwrite').click();
        cy.get('.utterances-container').should('not.have.class', 'theme-actual');
        cy.get('.utterances-container').should('not.have.class', 'theme-expected');

        cy.browseToStory('Groupo (1)');
        cy.dataCy('story-menu-item-story-group').should('not.include.text', 'Failing tests');
        cy.dataCy('story-menu-item-test_case').should('not.exist');
    });
});
