/* global cy:true */

describe('story visual editor', function () {
    afterEach(function () {
        cy.deleteProject('bf');
    });

    beforeEach(function () {
        cy.createProject('bf', 'My Project', 'en').then(
            () => cy.createNLUModelProgramatically('bf', '', 'de'),
        );
        cy.login();
        cy.visit('/project/bf/stories');
        cy.createStoryGroup();
        cy.createStoryInGroup();
    });

    it('should persist a user utterance, a bot response, and display add-user-line option appropriately', function () {
        cy.importNluData('bf', 'nlu_sample_en.json', 'en');
        cy.train();
        cy.visit('/project/bf/stories');
        cy.browseToStory('Groupo (1)');

        cy.dataCy('add-user-line').click({ force: true });
        cy.dataCy('user-line-from-input').last().click({ force: true });
        cy.addUserUtterance('hello !', 'chitchat.greet', 0, { checkForIntent: true });

        cy.contains('hello !'); // checks that text has been saved

        cy.dataCy('add-user-line').should('not.exist'); // cannot have adjacent user utterances
        cy.dataCy('add-bot-line').click({ force: true });

        cy.dataCy('from-text-template').click({ force: true });
        cy.dataCy('bot-response-input')
            .find('textarea').should('be.empty');

        cy.dataCy('bot-response-input')
            .find('textarea')
            .clear()
            .type('I do too.');

        cy.get('[agent=bot]').should('have.length', 1); // ensure that enter do not create a new response

        cy.dataCy('add-user-line').should('exist'); // would not lead to adjacent user utterances

        cy.dataCy('add-bot-line').click({ force: true });
        cy.contains('I do too.'); // checks that text has been saved
        cy.dataCy('from-qr-template').click({ force: true });
        cy.dataCy('bot-response-input').should('have.length', 2);
        cy.dataCy('bot-response-input')
            .eq(1)
            .find('textarea')
            .clear()
            .type('I do too qr');
        cy.dataCy('bot-response-input')
            .eq(1)
            .find('textarea')
            .blur({ force: true });
        cy.wait(1000);

        cy.addButtonOrSetPayload('postback option', { payload: { intent: 'get_started' } }, 'button_title');
        cy.addButtonOrSetPayload('web_url option', { url: 'https://myurl.com/' }, 0);

        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('story-editor')
            .find('.ace_line').eq(0)
            .should('have.text', '* chitchat.greet');
        cy.dataCy('story-editor').find('.ace_line')
            .eq(2).invoke('text')
            .then((response) => {
                cy.visit('/project/bf/responses/');
                cy.get('.rt-tbody > :nth-child(2)')
                    .find('[role=row]')
                    .contains('[role=row]', response.replace('-', '').trim())
                    .should('exist') // there's a row with our text and response hash
                    .find('.icon.edit')
                    .click();
                cy.dataCy('postback_option').contains('postback option').should('exist');
                cy.dataCy('web_url_option').contains('web_url option').should('exist');
            });

        cy.visit('/project/bf/nlu/models');
        cy.get('[role=row]')
            .contains('[role=row]', 'hello !')
            .contains('chitchat.greet')
            .should('exist'); // there nlu example is there too
    });

    it('should be able to click on intent in dropdown to change it', function () {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Groupo (1)');

        cy.dataCy('add-user-line').click({ force: true });
        cy.dataCy('user-line-from-input').last().click({ force: true });
        cy.dataCy('utterance-input')
            .find('input')
            .type('hello !{enter}');
        cy.dataCy('intent-label').should('have.length', 1);
        cy.dataCy('intent-label').eq(0).click();
        cy.get('.intent-dropdown input')
            .click({ force: true });
        cy.pause();
        cy.get('.row').contains('chitchat.bye').click();
        cy.dataCy('save-new-user-input').click({ force: true });
        cy.get('.utterances-container').contains('chitchat.bye').should('exist');
    });

    it('should rerender on language change', function () {
        cy.importNluData('bf', 'nlu_sample_en.json', 'en');

        cy.browseToStory('Get started');
        cy.dataCy('bot-response-input')
            .find('textarea')
            .type('I agree let\'s do it!!')
            .blur();

        cy.dataCy('language-selector').click().find('div').contains('German')
            .click({ force: true });
        cy.dataCy('single-story-editor').should('not.contain', 'Let\'s get started!');
        cy.dataCy('single-story-editor').should('not.contain', 'I agree let\'s do it!!');

        cy.dataCy('language-selector').click().find('div').contains('English')
            .click({ force: true });
        cy.get('.container > .ui.loader').should('exist');
        cy.dataCy('single-story-editor').should('contain', 'Let\'s get started!');
        cy.dataCy('single-story-editor').should('contain', 'I agree let\'s do it!!');
    });

    it('should use the canonical example if one is available', function () {
        cy.MeteorCall('nlu.insertExamplesWithLanguage', ['bf', 'en', [
            {
                text: 'bonjour canonical',
                intent: 'chitchat.greet',
                canonical: true,
            },
        ]]);
        cy.MeteorCall('nlu.insertExamplesWithLanguage', ['bf', 'en', [
            {
                text: 'bonjour not canonical',
                intent: 'chitchat.greet',
                canonical: false,

            },
        ]]);
        cy.visit('/project/bf/stories');
        cy.browseToStory('Greetings');
        cy.get('[role = "application"]').should('have.text', 'bonjour canonical');
    });

    it('should use the most recent example if no canonical is available', function () {
        cy.MeteorCall('nlu.insertExamplesWithLanguage', ['bf', 'en', [
            {
                text: 'bonjour not canonical',
                intent: 'chitchat.greet',
            },
        ]]);
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('icon-gem', null, '.active').click({ force: true });
        cy.dataCy('icon-gem', null, '.active').should('not.exist');
        cy.MeteorCall('nlu.insertExamplesWithLanguage', ['bf', 'en', [
            {
                text: 'bonjour not canonical recent',
                intent: 'chitchat.greet',
            },
        ]]);
        cy.visit('/project/bf/stories');
        cy.browseToStory('Greetings');
        cy.dataCy('single-story-editor').should('exist');
        cy.get('[role = "application"]').should('have.text', 'bonjour not canonical recent');
    });

    it('should add user utterance payload disjuncts, delete them, and Md representation should match', function () {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Greetings', 'Default stories');
        cy.dataCy('icon-add').click({ force: true });
        cy.dataCy('user-line-from-input').first().click({ force: true });
        cy.addUserUtterance('Bye', 'chitchat.bye', 1);
        cy.dataCy('toggle-md').click();
        cy.dataCy('story-editor')
            .find('.ace_line').eq(0)
            .should('have.text', '* chitchat.greet OR chitchat.bye');
        cy.dataCy('toggle-visual').click();
        cy.dataCy('icon-trash').first().click({ force: true });
        cy.dataCy('toggle-md').click();
        cy.dataCy('story-editor')
            .find('.ace_line').eq(0)
            .should('have.text', '* chitchat.bye');
    });

    it('should not utterance payload disjunct if some disjunct already has identical payload', function () {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Greetings', 'Default stories');
        cy.dataCy('intent-label').should('have.length', 1);
        cy.dataCy('icon-add').click({ force: true });
        cy.dataCy('user-line-from-input').first().click({ force: true });
        cy.addUserUtterance('Hello', 'chitchat.greet', 1);
        cy.dataCy('intent-label').should('have.length', 1);
    });
});
