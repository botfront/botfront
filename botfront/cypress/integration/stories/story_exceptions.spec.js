/* global cy:true */

describe('story exceptions', function() {
    const init = () => {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.browseToStory('Greetings', 'Default stories');
    };
    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr');
        cy.login();
        init();
    });
    const type = (text, n = 0) => {
        cy.dataCy('single-story-editor').eq(n).find('textarea').focus()
            .type(`{selectAll}{backSpace}{selectAll}{backSpace}{selectAll}{backSpace}${text}`, { force: true });
    };
    const typeError = (n = 0) => type('{selectAll}{del}* hi{enter}  - uu', n);
    const typeWarning = (n = 0) => type('{selectAll}{del}  - utter_hey', n);

    it('should display errors and warnings in the story top menu', function() {
        typeError();
        cy.dataCy('top-menu-error-alert').contains('1 Error').should('exist');
        typeWarning();
        cy.dataCy('top-menu-warning-alert').contains('1 Warning').should('exist');
    });

    it('should show the sum of errors and warnings from all stories in the story top menu', function() {
        typeError();
        cy.dataCy('top-menu-error-alert').contains('1 Error').should('exist');
        cy.dataCy('create-branch').click();
        cy.dataCy('branch-label');
        typeError(1);
        cy.dataCy('top-menu-error-alert').contains('2 Errors').should('exist');
        cy.dataCy('branch-tab-error-alert').should('have.length', 1);
        cy.dataCy('branch-label').eq(1).click();
        typeError(1);
        cy.dataCy('branch-tab-error-alert').should('have.length', 2);
        cy.dataCy('top-menu-error-alert').contains('3 Errors').should('exist');
    });

    it('should not display warning if no intents in branches', function() {
        cy.dataCy('create-branch').click();
        cy.dataCy('branch-label').should('have.length', 2);
        type('  - action_yep', 1);
        cy.dataCy('top-menu-warning-alert').should('not.exist');
    });
    it('should not display errors if no intents in destinationStory', function() {
        type('  - action_yep');
        cy.dataCy('top-menu-warning-alert').should('exist');
        cy.linkStory('Greetings', 'Farewells');
        cy.browseToStory('Farewells', 'Default stories');
        cy.get('.connected-story-alert').should('exist');
        cy.dataCy('top-menu-warning-alert').should('not.exist');
    });
});
