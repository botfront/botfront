/* eslint-disable no-undef */

describe('stories', function() {
    afterEach(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
    });

    it('should alert the user of errors', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.wait(200);
        cy.dataCy('story-group-error-alert').should('not.exist');
        cy.dataCy('top-menu-error-alert').should('not.exist');
        cy.get('.ace_line')
            .first()
            .click({ force: true })
            .get('textarea')
            .eq(0)
            .clear()
            .type('test error');
        cy.dataCy('story-group-error-alert').should('exist');
        cy.dataCy('top-menu-error-alert').contains('1 Error');
        cy.dataCy('create-branch')
            .click({ force: true });
        cy.wait(100);
        cy.get('.ace_line')
            .eq(1)
            .click({ force: true })
            .get('textarea')
            .eq(1)
            .type('test error');
        cy.dataCy('story-group-error-alert').should('exist');
        cy.dataCy('branch-tab-error-alert').should('exist');
        cy.dataCy('top-menu-error-alert').contains('2 Errors');
        cy.get('.ace_line')
            .eq(1)
            .click({ force: true })
            .get('textarea')
            .eq(1)
            .clear();
        cy.dataCy('story-group-error-alert').should('exist');
        cy.dataCy('top-menu-error-alert').contains('1 Error');
        cy.get('.ace_line')
            .first()
            .click({ force: true })
            .get('textarea')
            .eq(0)
            .clear();
        cy.dataCy('story-group-error-alert').should('not.exist');
        cy.dataCy('top-menu-error-alert').should('not.exist');
    });

    it('should remove alerts when a story is deleted', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.wait(200);
        cy.dataCy('story-group-error-alert').should('not.exist');
        cy.dataCy('top-menu-error-alert').should('not.exist');
        cy.get('.ace_line')
            .first()
            .click({ force: true })
            .get('textarea')
            .eq(0)
            .clear()
            .type('- utter_test')
            .type('{enter}test error');
        cy.dataCy('story-group-error-alert').should('exist');
        cy.dataCy('story-group-warning-alert').should('exist');

        cy.dataCy('add-story')
            .click({ force: true });
        cy.dataCy('delete-story')
            .first()
            .click({ force: true });
        cy.dataCy('confirm-yes')
            .click({ force: true });
        cy.wait(100);
        cy.dataCy('story-group-error-alert').should('not.exist');
        cy.dataCy('story-group-warning-alert').should('not.exist');

        cy.get('.ace_line')
            .first()
            .click({ force: true })
            .get('textarea')
            .eq(0)
            .clear()
            .type('- utter_test')
            .type('{enter}test error');
        cy.dataCy('delete-story')
            .first()
            .click({ force: true });
        cy.dataCy('confirm-yes')
            .click({ force: true });
        cy.dataCy('story-group-error-alert').should('not.exist');
        cy.dataCy('story-group-warning-alert').should('not.exist');
    });

    it('should alert the user of wanings', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.wait(200);
        cy.get('.ace_line')
            .first()
            .click({ force: true })
            .get('textarea')
            .eq(0)
            .clear();
        cy.dataCy('story-group-warning-alert').should('not.exist');
        cy.dataCy('top-menu-warning-alert').should('not.exist');
        cy.get('.ace_line')
            .first()
            .click({ force: true })
            .get('textarea')
            .eq(0)
            .type('- ');
        cy.dataCy('story-group-warning-alert').should('exist');
        cy.dataCy('top-menu-warning-alert').contains('1 Warning');
        cy.dataCy('create-branch')
            .click({ force: true });
        cy.wait(100);
        cy.get('.ace_line')
            .eq(1)
            .click({ force: true })
            .get('textarea')
            .eq(1)
            .type('- ');
        cy.dataCy('story-group-warning-alert').should('exist');
        cy.dataCy('branch-tab-warning-alert').should('exist');
        cy.dataCy('top-menu-warning-alert').contains('2 Warnings');
        cy.get('.ace_line')
            .eq(1)
            .click({ force: true })
            .get('textarea')
            .eq(1)
            .clear();
        cy.dataCy('story-group-warning-alert').should('exist');
        cy.dataCy('branch-tab-warning-alert').should('not.exist');
        cy.dataCy('top-menu-warning-alert').contains('1 Warning');
        cy.get('.ace_line')
            .first()
            .click({ force: true })
            .get('textarea')
            .eq(0)
            .clear();
        cy.dataCy('story-group-warning-alert').should('not.exist');
        cy.dataCy('top-menu-warning-alert').should('not.exist');
    });
});
