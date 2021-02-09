
/* global cy */

describe('incoming page conversation tab', function () {
    beforeEach(function () {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
            cy.setTimezoneOffset();
        });
    });

    afterEach(function () {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('should show a message if no converastions', function () {
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations')
            .click();
        cy.dataCy('no-conv').should('exist');
    });


    it('should list all conversation in db', function () {
        cy.addConversationFromTemplate('bf', 'default', 'test1');
        cy.addConversationFromTemplate('bf', 'default', 'test2');
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations')
            .click();
        cy.dataCy('conversation-item').should('have.length', 2);
    });
    it('should be possible to select a conversation', function () {
        cy.addCustomConversation('bf', 'test1', { events: [{ type: 'user', name: 'test1', text: 'one' }] });
        cy.addCustomConversation('bf', 'test2', { events: [{ type: 'user', name: 'test2', text: 'two' }] });
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations').click();
        cy.dataCy('conversation-item').eq(1).should('have.text', 'test1');
        cy.dataCy('conversation-item').eq(1).click({ force: true });
        cy.dataCy('utterance-text').contains('one').should('exist');
    });
});

describe('incoming page conversation tab pagination', function () {
    beforeEach(function () {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
            cy.setTimezoneOffset();
        });
    });

    afterEach(function () {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('should have no pagination if 20 conversation or less', function () {
        for (let i = 0; i < 20; i += 1) {
            cy.addConversationFromTemplate('bf', 'default', `test${i}`);
        }
        cy.wait(1000);
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations')
            .click();
        cy.dataCy('pagination').should('not.exist');
        cy.dataCy('conversation-item').should('have.length', 20);
    });

    it('should have pagination if more than 20 conversations', function () {
        for (let i = 0; i < 25; i += 1) {
            cy.addConversationFromTemplate('bf', 'default', `test${i}`);
        }
        cy.wait(1000);
        cy.visit('/project/bf/incoming');
        cy.dataCy('conversations')
            .click();
        cy.dataCy('duration-filter-to')
            .find('input')
            .type('15');
        // add a filter to check that the query string is not removed by navigation
        cy.dataCy('apply-filters').click();
        cy.wait(100);
        cy.dataCy('conversation-item')
            .should('have.length', 20);
        cy.dataCy('pagination').should('exist');
        cy.dataCy('pagination').children().last().click({ force: true });
        cy.dataCy('conversation-item').should('have.length', 5);
        cy.reload(); // deep linking should bring the user to the same location after a refresh
        cy.dataCy('conversation-item').should('have.length', 5);
        cy.dataCy('duration-filter-to').find('input').should('have.value', '15');
    });
});
