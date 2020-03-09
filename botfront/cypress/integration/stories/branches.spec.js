/* global cy:true */

describe('branches', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
    });

    afterEach(function() {
        cy.deleteProject('bf');
    });

    it('should be able to add a branch, edit the content and it should be saved', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.get('[data-cy=open-chat]').click();
        cy.dataCy('create-branch').click({ force: true });
        cy.dataCy('branch-label').should('have.lengthOf', 2);
        cy.dataCy('story-editor')
            .get('textarea')
            .should('have.lengthOf', 2);
        cy.dataCy('story-editor')
            .get('textarea')
            .eq(1)
            .focus()
            .wait(50)
            .type('xxx', { force: true })
            .blur();
        cy.visit('/project/bf/stories');
        cy.get('[data-cy=open-chat]').click();
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('branch-label').should('have.lengthOf', 2);
        cy.dataCy('branch-label')
            .first()
            .click({ force: true });
        cy.dataCy('create-branch').click({ force: true });
        cy.contains('New Branch 2')
            .first()
            .click({ force: true });
        cy.contains('New Branch 1').click({ force: true });
        cy.contains('xxx').should('exist');
    });

    it('should be able to be create a third branch, and delete branches', function() {
        cy.visit('/project/bf/stories');
        cy.get('[data-cy=open-chat]').click();
        cy.dataCy('create-branch').click({ force: true });
        cy.dataCy('branch-label').should('have.lengthOf', 2);
        cy.dataCy('branch-label').first().should('have.class', 'active');

        // create a third branch
        cy.dataCy('add-branch').click({ force: true });
        cy.dataCy('branch-label').should('have.lengthOf', 3);
        cy.dataCy('branch-label').last().should('have.class', 'active');

        cy.dataCy('delete-branch')
            .first()
            .click({ force: true });
        cy.wait(250);
        cy.dataCy('delete-branch')
            .first()
            .click({ force: true });
        cy.wait(250);
        cy.dataCy('delete-branch')
            .first()
            .click({ force: true });
        cy.wait(250);
        cy.dataCy('confirm-yes')
            .click({ force: true });

        cy.dataCy('branch-label').should('have.lengthOf', 2);
        cy.dataCy('branch-label').first().should('have.class', 'active');

        // delete a branch with only 2 branches remaining
        cy.dataCy('delete-branch')
            .first()
            .click({ force: true });
        cy.wait(250);
        cy.dataCy('delete-branch')
            .first()
            .click({ force: true });
        cy.wait(250);
        cy.dataCy('confirm-yes')
            .click({ force: true });


        cy.dataCy('branch-label').should('not.exist', 2);
        cy.dataCy('create-branch')
            .find('i')
            .should('not.have.class', 'disabled');
    });

    it('should be able to persist the opened branches across the app', function() {
        cy.visit('/project/bf/stories');
        cy.get('[data-cy=open-chat]').click();
        cy.dataCy('create-branch').click({ force: true });

        // create a third branch
        cy.dataCy('add-branch').click({ force: true });
        cy.dataCy('branch-label').should('have.lengthOf', 3);
        cy.contains('NLU').click({ force: true });
        cy.contains('Stories').click({ force: true });
        cy.dataCy('branch-label').should('have.lengthOf', 3);
        cy.dataCy('branch-label')
            .eq(2)
            .should('have.class', 'active');
    });

    it('should be able to merge deleted story branches', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('open-chat').click();
        cy.dataCy('create-branch').click({ force: true });

        cy.dataCy('branch-label').should('have.lengthOf', 2);
        cy.dataCy('branch-label').first().should('have.class', 'active');

        cy.dataCy('branch-label')
            .eq(1)
            .click();
        cy.wait(250);
        cy.dataCy('branch-label')
            .eq(1)
            .click();
        cy.wait(250);
            
        cy.dataCy('story-editor')
            .get('textarea')
            .eq(1)
            .focus()
            .type('xxx', { force: true });

        cy.dataCy('branch-label').should('have.lengthOf', 2);
        cy.dataCy('branch-label').eq(1).should('have.class', 'active');

        cy.dataCy('branch-label')
            .first()
            .click();
        cy.wait(250);

        cy.dataCy('delete-branch')
            .first()
            .click({ force: true });
        cy.wait(250);
        cy.dataCy('delete-branch')
            .first()
            .click({ force: true });
        cy.wait(250);
        cy.dataCy('confirm-yes')
            .click({ force: true });
        cy.contains('xxx');
    });
});
