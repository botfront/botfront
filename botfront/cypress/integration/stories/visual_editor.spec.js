/* eslint-disable no-undef */

describe('story visual editor', function() {
    before(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr');
        cy.createUser('admin', 'admin@bf.com', 'project-admin', 'bf');
        cy.loginTestUser('admin@bf.com');
    });

    afterEach(function() {
        cy.deleteUser('admin@bf.com');
        cy.deleteProject('bf');
    });

    it('should be able to create a basic story visually', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type('myTest{enter}');
        cy.dataCy('toggle-visual').click({ force: true });

        cy.dataCy('add-user-line').click({ force: true });
        cy.dataCy('user-line-from-input').click({ force: true });
        cy.dataCy('utterance-input')
            .find('input')
            .type('I love typing into boxes.{enter}');
        cy.dataCy('intent-label').trigger('mouseover');
        cy.dataCy('intent-dropdown').click({ force: true })
            .find('input')
            .type('myTestIntent{enter}');
        cy.dataCy('save-new-user-input').click({ force: true });

        // new user utterance box should not exist

        cy.dataCy('add-bot-line').click({ force: true });
        cy.dataCy('from-text-template').click({ force: true });
        cy.dataCy('bot-response-input')
            .find('textarea')
            .clear()
            .type('I do too.{enter}');

        // new user utterance box should exist

        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('story-editor')
            .find('.ace_line').eq(0)
            .should('have.text', '* myTestIntent');
        cy.dataCy('story-editor').find('.ace_line')
            .eq(1).invoke('text')
            .as('response');

        cy.visit('/project/bf/dialogue/templates/');
        cy.get('@response').then((response) => {
            cy.get('[role=row]')
                .contains('[role=row]', 'I do too.')
                .contains(response.replace('-', '').trim())
                .should('exist');
        });

        cy.visit('/project/bf/nlu/models');
        cy.get('[role=row]')
            .contains('[role=row]', 'I love typing into boxes.')
            .contains('myTestIntent')
            .should('exist');
    });
});
