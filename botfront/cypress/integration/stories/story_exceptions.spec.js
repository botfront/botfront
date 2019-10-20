/* eslint-disable no-undef */

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
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input').children('input').type('excpetion test{enter}');
        cy.dataCy('browser-item').children('span').contains('excpetion test').click();
    };
    const typeError = (textareaIndex, aceLineIndex) => {
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
            .clear();
    };

    it('should display errors and warnings in the story top menu', function() {
        createTestStoryGroup();
        cy.get(':nth-child(1) > [data-cy=single-story-editor] > #story > .ace_scroller > .ace_content')
            .find('.ace_line')
            .click({ force: true });
        cy.get(':nth-child(1) > [data-cy=single-story-editor] > #story')
            .find('textarea')
            .type('error')
            .type('{enter}')
            .type('* hi')
            .type('{enter}')
            .type('- utter_');
        cy.dataCy('top-menu-error-alert').contains('1 Error').should('exist');
        cy.dataCy('top-menu-warning-alert').contains('1 Warning').should('exist');
    });

    it('should show the sum of errors and warnings from all stories in the story top menu', function() {
        createTestStoryGroup();
        typeError(0, 0);
        cy.dataCy('top-menu-error-alert').contains('1 Error').should('exist');
        typeWarning(0, 0);
        cy.dataCy('top-menu-error-alert').contains('1 Error').should('exist');
        cy.dataCy('top-menu-warning-alert').contains('1 Warning').should('exist');
        cy.dataCy('create-branch').click();
        cy.get(':nth-child(2) > [data-cy=single-story-editor] > #story > .ace_scroller > .ace_content')
            .find('.ace_line')
            .click({ force: true });
        cy.get(':nth-child(2) > [data-cy=single-story-editor] > #story')
            .find('textarea')
            .type('error')
            .type('{enter}')
            .type('* hi')
            .type('{enter}')
            .type('- utter_');
        cy.dataCy('top-menu-error-alert').contains('2 Errors').should('exist');
        cy.dataCy('top-menu-warning-alert').contains('2 Warnings').should('exist');
        cy.dataCy('branch-tab-error-alert').should('exist');
        cy.dataCy('branch-tab-warning-alert').should('exist');
        
        cy.dataCy('branch-label').eq(1).click();
        cy.get(':nth-child(2) > [data-cy=single-story-editor] > #story > .ace_scroller > .ace_content')
            .find('.ace_line')
            .click({ force: true });
        cy.get(':nth-child(2) > [data-cy=single-story-editor] > #story')
            .find('textarea')
            .type('error')
            .type('{enter}')
            .type('* hi')
            .type('{enter}')
            .type('- utter_');
        cy.dataCy('top-menu-error-alert').contains('3 Errors').should('exist');
        cy.dataCy('top-menu-warning-alert').contains('3 Warnings').should('exist');
    });

    it('should display warnings from nested branches in the story top menu and each level of branch menus', function() {
        createTestStoryGroup();
        cy.dataCy('create-branch').click();
        cy.dataCy('create-branch').click();
        cy.get(':nth-child(3) > [data-cy=single-story-editor] > #story > .ace_scroller > .ace_content')
            .find('.ace_line')
            .click({ force: true });
        cy.get(':nth-child(3) > [data-cy=single-story-editor] > #story')
            .find('textarea')
            .type('error')
            .type('{enter}')
            .type('* hi')
            .type('{enter}')
            .type('- utter_');
        cy.dataCy('top-menu-error-alert').contains('1 Error').should('exist');
        cy.dataCy('top-menu-warning-alert').contains('1 Warning').should('exist');
        cy.dataCy('branch-tab-error-alert').eq(1).should('exist');
        cy.dataCy('branch-tab-warning-alert').eq(1).should('exist');

        clearAceEditor(2, 3);
        cy.dataCy('top-menu-error-alert').should('not.exist');
        cy.dataCy('top-menu-warning-alert').should('not.exist');
    });

    it('should not display errors if no intents in branches', function() {
        createTestStoryGroup();
        cy.dataCy('create-branch').should('have.length.of', 1);
        cy.dataCy('create-branch').click();
        cy.get(':nth-child(2) > [data-cy=single-story-editor] > #story > .ace_scroller > .ace_content')
            .find('.ace_line')
            .should('have.length.of', 1);
        cy.get(':nth-child(2) > [data-cy=single-story-editor] > #story > .ace_scroller > .ace_content')
            .find('.ace_line')
            .click({ force: true });
        cy.get(':nth-child(2) > [data-cy=single-story-editor] > #story')
            .find('textarea')
            .type('- action_test');
        cy.dataCy('top-menu-warning-alert').should('not.exist');
    });

    it('should not display errors if no intents in destinationStory', function() {
        createTestStoryGroup();
        cy.dataCy('add-story').click();
        cy.get(
            ':nth-child(2) > [data-cy=single-story-editor] > #story > .ace_scroller > .ace_content',
        )
            .find('.ace_line')
            .click({ force: true });
        cy.get(':nth-child(2) > [data-cy=single-story-editor] > #story')
            .find('textarea')
            .type('- action_test');
        cy.dataCy('top-menu-warning-alert').should('exist');
        cy.dataCy('stories-linker')
            .first()
            .click();
        cy.dataCy('stories-linker')
            .find('div.item')
            .eq(3)
            .click();
        cy.dataCy('stories-linker')
            .first()
            .should('contains.text', 'excpetion test 2');
        cy.dataCy('top-menu-warning-alert').should('not.exist');
    });
});
