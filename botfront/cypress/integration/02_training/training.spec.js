/* global cy Cypress:true */
describe('Training', function() {
    function createStories() {
        cy.visit('/project/bf/stories');
        cy.createStoryGroup();
        cy.createStoryInGroup();
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('story-editor')
            .get('textarea')
            .focus()
            .type('{selectAll}{backSpace}{backSpace}* chitchat.greet\n  - utter_hi   ', { force: true })
            .blur();
    }

    before(function() {
        // just in case it's not deleted
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
        cy.waitForResolve(Cypress.env('RASA_URL'));
        cy.wait(1000);
        cy.request('DELETE', `${Cypress.env('RASA_URL')}/model`);
    });
    
    afterEach(function() {
        cy.deleteProject('bf');
    });
    
    it('Should train and serve a model containing only stories (no NLU) and adding a language should work', function() {
        createStories();
        cy.train();
        cy.newChatSesh();
        cy.testChatInput('/chitchat.greet', 'utter_hi');
        cy.importNluData('bf', 'nlu_sample_en.json', 'en');
        cy.train();
        cy.newChatSesh();
        cy.testChatInput('hi', 'utter_hi'); // nlg returns template name if not defined
    });

    it('Should train and serve a model containing stories + NLU in one language and adding a second language should work too', function() {
        cy.visit('/project/bf/stories');
        cy.importNluData('bf', 'nlu_sample_en.json', 'en');
        createStories();
        cy.train();
        cy.newChatSesh();
        cy.testChatInput('hi', 'utter_hi');
        cy.createNLUModelProgramatically('bf', '', 'fr'); // first don't import NLU data
        cy.train();
        cy.importNluData('bf', 'nlu_sample_fr.json', 'fr'); // now import the data
        cy.train();
        cy.newChatSesh('fr');
        cy.testChatInput('salut', 'utter_hi');
    });

    it('Should train and serve a model containing stories and NLU in 2 languages', function() {
        cy.visit('/project/bf/stories');
        cy.importNluData('bf', 'nlu_sample_en.json', 'en');
        cy.createNLUModelProgramatically('bf', '', 'fr');
        cy.importNluData('bf', 'nlu_sample_fr.json', 'fr');
        createStories();
        cy.train();
        cy.newChatSesh();
        cy.testChatInput('hi', 'utter_hi');
        cy.newChatSesh('fr');
        cy.testChatInput('salut', 'utter_hi');
    });

    it('Should only train focused stories', function() {
        createStories();
        cy.get('.eye.icon.focused').should('have.length', 0);
        cy.toggleStoryGroupFocused();
        cy.get('.eye.icon.focused').should('have.length', 1);
        cy.train();
        cy.newChatSesh();
        cy.testChatInput('/get_started', 'utter_default');
        cy.testChatInput('/chitchat.greet', 'utter_hi');
        cy.toggleStoryGroupFocused();
        cy.get('.eye.icon.focused').should('have.length', 0);
        cy.createStoryGroup({ groupName: 'Intro stories' });
        cy.moveStoryOrGroup({ name: 'Get started' }, { name: 'Intro stories' });
        cy.checkMenuItemAtIndex(1, 'Get started');
        cy.toggleStoryGroupFocused('Intro stories');
        cy.get('.eye.icon.focused').should('have.length', 1);
        cy.train();
        cy.newChatSesh();
        cy.testChatInput('/get_started', 'utter_get_started');
        cy.testChatInput('/chitchat.greet', 'utter_default');
    });
    
    it('Should train and serve a model containing branches and links', function() {
        cy.importViaUi('branch_link_project.json', 'bf');
        cy.train();
        cy.newChatSesh();
        // coffee path
        cy.testChatInput('/hi', 'utter_coffee');
        cy.testChatInput('/yes', 'utter_sugar');
        cy.testChatInput('/yes', 'utter_ok');
        // tea path
        cy.testChatInput('/hi', 'utter_coffee');
        cy.testChatInput('/no', 'utter_tea');
        cy.testChatInput('/yes', 'utter_sugar');
        cy.testChatInput('/no', 'utter_oknosugar');
    });
});
