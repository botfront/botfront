/* global cy:true */

describe('story exceptions', function() {
    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr');
        cy.login();
    });
    const createTestStoryGroup = () => {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input').children('input').type('excpetion test{enter}');
        cy.dataCy('browser-item').children('span').contains('excpetion test').click();
    };
    const typeError = (textareaIndex, aceLineIndex) => {
        // Makes it wait until it actually exists
        cy.get('.ace_content');
        cy.get('.ace_content')
            .eq(aceLineIndex)
            .click({ force: true })
            .get('textarea')
            .eq(textareaIndex)
            .type('error');
    };
    const typeWarning = (textareaIndex, aceLineIndex) => {
        cy.get('.ace_line', { timeout: 10000 })
            .eq(aceLineIndex)
            .click({ force: true })
            .get('textarea')
            .eq(textareaIndex)
            .type('{enter}')
            .type('* hi')
            .type('{enter}')
            .type('- utter_');
    };
    
    const clearAceEditor = (textareaIndex, aceLineIndex) => {
        cy.get('.ace_line', { timeout: 10000 })
            .eq(aceLineIndex)
            .click({ force: true });
        cy.get('textarea')
            .eq(textareaIndex)
            .type('{selectAll}{del}{selectAll}{del}');
    };

    it('should display errors and warnings in the story top menu', function() {
        createTestStoryGroup();
        cy.get('[data-cy=story-editor] > [data-cy=single-story-editor] > #story > .ace_scroller > .ace_content')
            .find('.ace_line')
            .click({ force: true });
        cy.get('[data-cy=story-editor] > [data-cy=single-story-editor] > #story')
            .find('textarea')
            .type('error')
            .type('{enter}')
            .type('* hi')
            .type('{enter}')
            .type('- utter_');
        cy.dataCy('top-menu-error-alert').contains('1 Error').should('exist');
    });

    it('should show the sum of errors and warnings from all stories in the story top menu', function() {
        createTestStoryGroup();
        typeError(0, 0);
        cy.dataCy('top-menu-error-alert').contains('1 Error').should('exist');
        typeWarning(0, 0);
        cy.dataCy('top-menu-error-alert').contains('1 Error').should('exist');
        cy.dataCy('create-branch').click();
        cy.dataCy('branch-label');
        cy.dataCy('single-story-editor')
            .eq(1)
            .find('.ace_line')
            .click({ force: true });
        cy.dataCy('single-story-editor')
            .eq(1)
            .find('textarea')
            .type('error')
            .type('{enter}')
            .type('* hi')
            .type('{enter}')
            .type('- utter_');
        cy.dataCy('top-menu-error-alert').contains('2 Errors').should('exist');
        cy.dataCy('branch-tab-error-alert').should('exist');
        
        cy.dataCy('branch-label').eq(1).click();
        cy.get('.ace_content').eq(1).contains('error').should('not.exist');
        cy.get('.ace_line')
            .eq(3)
            .click({ force: true });
        cy.dataCy('single-story-editor')
            .eq(1)
            .find('textarea')
            .type('error')
            .type('{enter}')
            .type('* hi')
            .type('{enter}')
            .type('- utter_');
        cy.dataCy('top-menu-error-alert').contains('3 Errors').should('exist');
    });

    it('should display warnings from nested branches in the story top menu and each level of branch menus', function() {
        createTestStoryGroup();
        cy.dataCy('create-branch').click();
        cy.dataCy('branch-label').should('have.length', 2);
        cy.dataCy('create-branch').click();
        cy.dataCy('branch-label').should('have.length', 4);
        cy.get(':nth-child(3) > [data-cy=single-story-editor] > #story > .ace_scroller > .ace_content')
            .find('.ace_line')
            .click({ force: true });
        cy.get(':nth-child(3) > [data-cy=single-story-editor] > #story')
            .find('textarea')
            .type('error', { force: true })
            .type('{enter}', { force: true })
            .type('* hi', { force: true })
            .type('{enter}', { force: true })
            .type('- utter_', { force: true });
        cy.dataCy('top-menu-error-alert').contains('1 Error').should('exist');
        cy.dataCy('branch-tab-error-alert').eq(1).should('exist');

        
        clearAceEditor(2, 3);
        cy.get('textarea').should('have.text', '');
        cy.dataCy('top-menu-error-alert').should('not.exist');
    });

    it('should not display errors if no intents in branches', function() {
        createTestStoryGroup();
        cy.dataCy('create-branch').should('have.length.of', 1);
        cy.dataCy('create-branch').click();
        cy.dataCy('branch-label').should('have.length', 2);
        cy.get('.ace_line')
            .eq(1)
            .should('have.length.of', 1);
        cy.get('.ace_line')
            .eq(1)
            .click({ force: true });
        cy.get(':nth-child(2) > [data-cy=single-story-editor] > #story')
            .find('textarea')
            .type('- action_test');
        cy.dataCy('top-menu-warning-alert').should('not.exist');
    });

    it('should not display errors if no intents in destinationStory', function() {
        createTestStoryGroup();
        cy.dataCy('create-branch').should('have.length.of', 1);
        cy.dataCy('add-story').click();
        cy.get('.ace_line').should('have.length', 2);
        cy.get('.ace_line')
            .eq(1)
            .click({ force: true });
        cy.dataCy('single-story-editor')
            .eq(1)
            .find('textarea')
            .type('- action_test', { force: true });
        cy.dataCy('top-menu-warning-alert').should('exist');
        cy.dataCy('stories-linker')
            .first()
            .click();
        cy.dataCy('stories-linker')
            .find('div.item')
            .eq(3)
            .click();
        cy.dataCy('story-footer').should('have.class', 'linked');
        cy.dataCy('stories-linker')
            .first()
            .should('contains.text', 'excpetion test 2');
        cy.get('.connected-story-alert').should('exist'); // check for the message signaling that it has been linked
        cy.dataCy('top-menu-warning-alert').should('not.exist');
    });
});
