/* global cy:true */

describe('branches', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
        cy.visit('/project/bf/dialogue');
        cy.createStoryGroup();
        cy.createStoryInGroup();
    });

    afterEach(function() {
        cy.deleteProject('bf');
    });
    
    const newBranchNameOne = 'newBranchNameOne';
    const newBranchNameTwo = 'newBranchNameTwo';

    const clickFirstBranchTitle = () => {
        cy.dataCy('branch-label')
            .first()
            .click({ force: true })
            .wait(1000)
            .find('span')
            .click({ force: true });
    };

    it('should be able to add a branch, edit the content and it should be saved', function() {
        cy.dataCy('toggle-md').click({ force: true });
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
            .wait(100)
            .blur();
        cy.visit('/project/bf/dialogue'); // reload page
        cy.browseToStory();
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
        cy.dataCy('create-branch').click({ force: true });

        // create a third branch
        cy.dataCy('add-branch').click({ force: true });
        cy.dataCy('branch-label').should('have.lengthOf', 3);
        cy.contains('NLU').click({ force: true });
        cy.dataCy('dialogue-sidebar-link').click({ force: true });
        cy.browseToStory();
        cy.dataCy('branch-label').should('have.lengthOf', 3);
        cy.dataCy('branch-label')
            .eq(2)
            .should('have.class', 'active');
    });

    it('should be able to merge deleted story branches', function() {
        cy.dataCy('toggle-md').click({ force: true });
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

    it('should save branch title on blur and Enter, discard on esc', function() {
        cy.dataCy('create-branch').click({ force: true });

        // test Enter
        clickFirstBranchTitle();
        cy.dataCy('branch-label')
            .find('input')
            .click()
            .clear()
            .type(`${newBranchNameOne}{Enter}`);
        cy.dataCy('branch-label')
            .first()
            .find('span')
            .contains(newBranchNameOne)
            .should('exist');

        // test blur
        clickFirstBranchTitle();
        cy.dataCy('branch-label')
            .find('input')
            .click()
            .clear()
            .type(`${newBranchNameTwo}`)
            .blur();
        cy.dataCy('branch-label')
            .first()
            .find('span')
            .contains(newBranchNameTwo)
            .should('exist');

        // test esc
        clickFirstBranchTitle();
        cy.dataCy('branch-label')
            .find('input')
            .click()
            .type('edited{esc}{Enter}');
        cy.dataCy('branch-label')
            .first()
            .find('span')
            .contains(newBranchNameTwo)
            .should('exist')
            .contains(`${newBranchNameTwo}edited`)
            .should('not.exist');
    });
});
