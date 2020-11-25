/* global cy:true */

describe('story exceptions', function() {
    const init = () => {
        cy.visit('/project/bf/dialogue');
        cy.createStoryGroup({ groupName: 'Exception test group' });
        cy.createFragmentInGroup({ storyName: 'Exception test story', groupName: 'Exception test group' });
        cy.browseToStory('Exception test story', 'Exception test group');
        cy.dataCy('toggle-yaml').click({ force: true });
    };
    afterEach(function() {
        // cy.logout();
        // cy.deleteProject('bf');
    });
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr');
        cy.login();
        init();
    });
    const type = (text, n = 0) => {
        cy.wait(200);
        cy.dataCy('single-story-editor').eq(n).find('textarea').first()
            .focus()
            .type(`{selectAll}{del}{selectAll}{del}${text}`, { force: true })
            .blur();
    };
    const typeError = (n = 0) => type('- intent: hey{enter}  bla: bad key', n);

    it('should show the sum of exceptions from all stories in the story top menu', function() {
        cy.dataCy('create-branch').click();
        typeError();
        cy.dataCy('top-menu-error-alert').contains('1 Error').should('exist');
        typeError(1);
        cy.dataCy('top-menu-error-alert').contains('2 Errors').should('exist');
        cy.dataCy('branch-tab-error-alert').should('have.length', 1);
        cy.dataCy('branch-label').eq(1).click();
        typeError(1);
        cy.dataCy('branch-tab-error-alert').should('have.length', 2);
        cy.dataCy('top-menu-error-alert').contains('3 Errors').should('exist');
    });
});
