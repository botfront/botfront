/* global cy:true */

describe('Rule-specific behavior', function () {
    afterEach(function () {
        cy.deleteProject('bf');
    });

    beforeEach(function () {
        cy.createProject('bf', 'My Project', 'en').then(
            () => cy.createNLUModelProgramatically('bf', '', 'de'),
        );
        cy.login();
        cy.visit('/project/bf/dialogue');
        cy.browseToStory('Greetings');
    });

    it('should be possible to have at most 1 intent per rule body', () => {
        cy.dataCy('add-slot-line').should('exist'); // possible to add a line
        cy.dataCy('add-user-line').should('not.exist'); // but not user
        cy.dataCy('icon-trash').first().click({ force: true });
        cy.dataCy('add-user-line').should('exist');
    });
    it('should be possible to add a condition, then toggling conversation start should erase that condition', () => {
        cy.dataCy('connected-to').findCy('add-loop-line').first().click({ force: true });
        cy.dataCy('connected-to').findCy('activate-loop').should('not.exist'); // only in body, not in conditions
        cy.dataCy('connected-to').findCy('active-loop').should('exist').click({ force: true });
        cy.dataCy('connected-to').find('input').type('my_loopy_loop{enter}', { force: true });
        cy.contains('my_loopy_loop').should('exist');

        cy.dataCy('toggle-conversation-start').click();
        cy.dataCy('confirm-popup').should('exist').findCy('confirm-yes').click();
        cy.dataCy('connected-to').should('not.exist');

        cy.dataCy('toggle-conversation-start').click();
        cy.dataCy('connected-to').should('exist');
        cy.contains('my_loopy_loop').should('not.exist');
        cy.dataCy('toggle-conversation-start').click();
        cy.dataCy('connected-to').should('not.exist'); // no confirmation if condition was empty
    });
    it('should not be possible to add an action line as a condition', () => {
        cy.dataCy('connected-to').findCy('add-action-line').should('not.exist');
        cy.dataCy('toggle-yaml').click();
        cy.dataCy('connected-to')
            .get('textarea')
            .first()
            .type('- action: action_maybe', { force: true });
        cy.dataCy('top-menu-error-alert').contains('1 Error').should('exist');
    });
});
