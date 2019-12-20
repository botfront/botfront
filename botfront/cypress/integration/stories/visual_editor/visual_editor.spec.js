/* global cy expect:true */

const qrGold = new RegExp(`
buttons:
  - title: postback option
    type: postback
    payload: /get_started
  - title: web_url option
    type: web_url
    payload: 'https://myurl.com/'
`.replace(/\n/g, ''));

function clickStoryGroup(group) {
    const positions = ['topLeft', 'top', 'topRight', 'left', 'center', 'right', 'bottomLeft', 'bottom', 'bottomRight'];
    positions.map(p => cy.contains(group).click(p, { force: true }));
}

describe('story visual editor', function () {
    afterEach(function () {
        cy.deleteProject('bf');
    });

    beforeEach(function () {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
    });

    it('should persist a user utterance, a bot response, and display add-user-line option appropriately', function() {
        cy.importNluData('bf', 'nlu_sample_en.json', 'English');
        cy.train();
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type('myTest{enter}');
        clickStoryGroup('myTest');

        cy.dataCy('add-user-line').click({ force: true });
        cy.dataCy('user-line-from-input').click({ force: true });
        cy.dataCy('utterance-input')
            .find('input')
            .type('Hello{enter}');
        cy.dataCy('intent-label').contains('chitchat.greet')
            .click({ force: true });
        cy.get('.intent-dropdown input')
            .click({ force: true })
            .type('myTestIntent{enter}');
        cy.dataCy('save-new-user-input').click({ force: true });

        cy.contains('Hello'); // checks that text has been saved

        cy.dataCy('add-user-line').should('not.exist'); // cannot have adjacent user utterances

        cy.dataCy('add-bot-line').click({ force: true });

        cy.contains('Hello'); // checks that text has been saved

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

        cy.dataCy('button_title').click({ force: true });
        cy.dataCy('button_title').click({ force: true });

        cy.dataCy('enter-button-title')
            .find('input')
            .clear()
            .type('postback option');
        cy.dataCy('intent-label').contains('intent')
            .click({ force: true });
        cy.get('.intent-dropdown input')
            .type('get_started{enter}');
        cy.dataCy('save-button').click({ force: true });

        cy.dataCy('add-quick-reply').click({ force: true });

        cy.dataCy('button_title').click({ force: true });

        cy.dataCy('enter-button-title')
            .find('input')
            .clear()
            .type('web_url option');
        cy.dataCy('select-button-type')
            .find('[role=option]').eq(1)
            .click({ force: true });
        cy.dataCy('enter_url')
            .find('input')
            .clear()
            .type('https://myurl.com/');
        cy.dataCy('save-button').click({ force: true });

        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('story-editor')
            .find('.ace_line').eq(0)
            .should('have.text', '* myTestIntent');
        cy.dataCy('story-editor').find('.ace_line')
            .eq(2).invoke('text')
            .as('response');

        cy.visit('/project/bf/dialogue/templates/');
        cy.get('@response').then((response) => {
            cy.log(response);
            cy.get('[role=row]')
                .contains('[role=row]', response.replace('-', '').trim())
                .should('exist') // there's a row with our text and response hash
                .find('.icon.edit')
                .click();
            cy.get('.response-message-0:not(.button)')
                .invoke('text')
                .as('qr');
        });
        cy.get('@qr').then(qr => expect(qr).to.match(qrGold)); // test qr template against gold

        cy.visit('/project/bf/nlu/models');
        cy.get('[role=row]')
            .contains('[role=row]', 'Hello')
            .contains('myTestIntent')
            .should('exist'); // there nlu example is there too
    });

    it('should use the canonical example if one is available', function () {
        cy.MeteorCall('nlu.insertExamplesWithLanguage', ['bf', 'fr', [
            {
                text: 'bonjour canonical',
                intent: 'chitchat.greet',
                canonical: true,
            },
        ]]);
        cy.MeteorCall('nlu.insertExamplesWithLanguage', ['bf', 'fr', [
            {
                text: 'bonjour not canonical',
                intent: 'chitchat.greet',
                canonical: false,

            },
        ]]);
        cy.visit('/project/bf/stories');
        cy.dataCy('browser-item')
            .contains('Default stories')
            .click({ force: true });
        cy.get('[role = "application"]').should('have.text', 'bonjour canonical');
    });

    it('should use the most recent example if no canonical is available', function () {
        cy.MeteorCall('nlu.insertExamplesWithLanguage', ['bf', 'fr', [
            {
                text: 'bonjour not canonical',
                intent: 'chitchat.greet',
            },
        ]]);
        cy.visit('/project/bf/nlu/models');
        cy.get('.black.gem').click({ force: true });
        cy.get('.black.gem').should('not.exist');
        cy.MeteorCall('nlu.insertExamplesWithLanguage', ['bf', 'fr', [
            {
                text: 'bonjour not canonical recent',
                intent: 'chitchat.greet',
            },
        ]]);
        cy.visit('/project/bf/stories');
        cy.dataCy('browser-item')
            .contains('Default stories')
            .click({ force: true });
        cy.get('[role = "application"]').should('have.text', 'bonjour not canonical recent');
    });
});
