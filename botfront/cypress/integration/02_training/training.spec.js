/* global cy Cypress:true */
describe('Training', function() {
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
        cy.visit('/project/bf/stories');
    });
    
    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });
    
    it('Should train and serve a model containing only stories (no NLU) and adding a language should work', function() {
        cy.train();
        cy.newChatSesh();
        cy.testChatInput('/chitchat.greet', 'utter_hi');
        cy.importNluData('bf', 'nlu_sample_en.json', 'en');
        cy.train();
        cy.newChatSesh();
        cy.testChatInput('hi', 'utter_hi'); // nlg returns template name if not defined
    });

    it('Should train and serve a model containing stories + NLU in one language and adding a second language should work too', function() {
        cy.importNluData('bf', 'nlu_sample_en.json', 'en');
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
        cy.importNluData('bf', 'nlu_sample_en.json', 'en');
        cy.createNLUModelProgramatically('bf', '', 'fr');
        cy.importNluData('bf', 'nlu_sample_fr.json', 'fr');
        cy.train();
        cy.newChatSesh();
        cy.testChatInput('hi', 'utter_hi');
        cy.newChatSesh('fr');
        cy.testChatInput('salut', 'utter_hi');
    });

    it('Should only train focused stories', function() {
        cy.get('.eye.icon.focused').should('have.length', 0);
        cy.createStoryGroup();
        cy.moveStoryOrGroup({ name: 'Greetings' }, { name: 'Groupo' });
        cy.checkMenuItemAtIndex(1, 'Greetings');
        cy.createStoryGroup({ groupName: 'Intro stories' });
        cy.moveStoryOrGroup({ name: 'Get started' }, { name: 'Intro stories' });
        cy.checkMenuItemAtIndex(1, 'Get started');
        cy.toggleStoryGroupFocused();
        cy.get('.eye.icon.focused').should('have.length', 1);
        cy.train();
        cy.newChatSesh();
        cy.testChatInput('/get_started', 'utter_hi');
        cy.testChatInput('/chitchat.greet', 'utter_hi');
        cy.toggleStoryGroupFocused();
        cy.get('.eye.icon.focused').should('have.length', 0);
        cy.toggleStoryGroupFocused('Intro stories');
        cy.get('.eye.icon.focused').should('have.length', 1);
        cy.train();
        cy.newChatSesh();
        cy.testChatInput('/get_started', 'utter_get_started');
        cy.testChatInput('/chitchat.greet', 'utter_get_started');
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

    it('Should access bot via sharing link if and only if sharing is enabled', function() {
        cy.visit('/chat/bf/');
        cy.get('body').contains('Sharing not enabled for project').should('exist');
        cy.train();
        cy.dataCy('share-bot').trigger('mouseover');
        cy.dataCy('toggle-bot-sharing').should('exist').should('not.have.class', 'checked')
            .click()
            .should('have.class', 'checked');
        cy.visit('/chat/bf/');
        cy.get('body').contains('Sharing not enabled for project').should('not.exist');
        cy.get('body').contains('utter_get_started').should('exist');
    });
});
