/* global cy Cypress:true */
describe('Training', function() {
    function clickStoryGroup(group) {
        const positions = ['topLeft', 'top', 'topRight', 'left', 'center', 'right', 'bottomLeft', 'bottom', 'bottomRight'];
        positions.map(p => cy.contains(group).click(p, { force: true }));
    }

    function createStories() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type('Group{enter}');
        clickStoryGroup('Group');
        cy.dataCy('story-editor')
            .get('textarea')
            .focus()
            .type('{selectAll}{backSpace}{backSpace}{backSpace}{backSpace}', { force: true });
        cy.dataCy('story-editor')
            .get('textarea')
            .focus()
            .type('{backSpace}{backSpace}* chitchat.greet\n  - utter_hi   ', { force: true });
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
        cy.dataCy('open-chat').click({ force: true });
        cy.newChatSesh('en');
        cy.testChatInput('/chitchat.greet', 'utter_hi');
        cy.importNluData('bf', 'nlu_sample_en.json', 'English');
        cy.train();
        cy.dataCy('open-chat').click({ force: true });
        cy.newChatSesh('en');
        cy.testChatInput('hi', 'utter_hi'); // nlg returns template name if not defined
    });

    it('Should train and serve a model containing stories + NLU in one language and adding a second language should work too', function() {
        cy.visit('/project/bf/stories');
        cy.importNluData('bf', 'nlu_sample_en.json', 'English');
        createStories();
        cy.train();
        cy.dataCy('open-chat').click({ force: true });
        cy.newChatSesh('en');
        cy.testChatInput('hi', 'utter_hi');
        cy.createNLUModelProgramatically('bf', '', 'fr'); // first don't import NLU data
        cy.train();
        cy.importNluData('bf', 'nlu_sample_fr.json', 'French'); // now import the data
        cy.train();
        cy.dataCy('open-chat').click({ force: true });
        cy.newChatSesh('fr');
        cy.testChatInput('salut', 'utter_hi');
    });

    it('Should train and serve a model containing stories and NLU in 2 languages', function() {
        cy.visit('/project/bf/stories');
        cy.importNluData('bf', 'nlu_sample_en.json', 'English');
        cy.createNLUModelProgramatically('bf', '', 'fr');
        cy.importNluData('bf', 'nlu_sample_fr.json', 'French');
        createStories();
        cy.train();
        cy.dataCy('open-chat').click({ force: true });
        cy.newChatSesh('en');
        cy.testChatInput('hi', 'utter_hi');
        cy.newChatSesh('fr');
        cy.testChatInput('salut', 'utter_hi');
    });
});
