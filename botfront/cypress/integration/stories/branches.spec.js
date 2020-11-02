/* global cy:true */

const getBranchContainer = (depth) => {
    let branch = cy.dataCy('single-story-editor').first();
    for (let i = 0; i < depth; i += 1) {
        branch = branch.find('[data-cy=single-story-editor]').first();
    }
    return branch;
};
const getBranchEditor = depth => getBranchContainer(depth).find('.story-visual-editor').first();
const addBlock = (depth) => {
    getBranchEditor(depth).then((editor) => {
        cy.wrap(editor)
            .findCy('add-user-line')
            .click({ force: true });
        cy.wrap(editor)
            .findCy('user-line-from-input')
            .last()
            .click({ force: true });
        cy.dataCy('utterance-input')
            .find('input')
            .type('I love typing into boxes.{enter}');
        cy.dataCy('intent-label').should('have.length', depth + 1);
        cy.wrap(editor)
            .findCy('intent-label')
            .click({ force: true })
            .type('myTestIntent{enter}');
    });
    cy.dataCy('save-new-user-input')
        .click({ force: true });
    cy.dataCy('save-new-user-input').should('not.exist');
};

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
            .type('- intent: hey', { force: true })
            .blur();
        cy.wait(700);
        cy.visit('/project/bf/dialogue'); // reload page
        cy.browseToStory();
        cy.dataCy('toggle-md').click({ force: true });
        cy.dataCy('branch-label').should('have.lengthOf', 2);
        cy.dataCy('branch-label')
            .first()
            .click({ force: true });
        cy.contains('- intent: hey').should('exist');
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
        cy.dataCy('confirm-yes')
            .click({ force: true });

        cy.dataCy('branch-label').should('have.lengthOf', 2);
        cy.dataCy('branch-label').first().should('have.class', 'active');

        // delete a branch with only 2 branches remaining
        cy.dataCy('delete-branch')
            .first()
            .click({ force: true });
        cy.dataCy('confirm-yes')
            .click({ force: true });

        cy.dataCy('branch-label').should('not.exist');
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
            .type('- intent: aaa', { force: true });

        cy.dataCy('branch-label').should('have.lengthOf', 2);
        cy.dataCy('branch-label').eq(1).should('have.class', 'active');


        cy.dataCy('create-branch').click({ force: true });
        cy.dataCy('single-story-editor').should('have.length', 3);
        cy.dataCy('single-story-editor')
            .get('textarea')
            .last()
            .focus()
            .type('- intent: bbb', { force: true })
            .blur();
        cy.wait(250);

        cy.dataCy('branch-label')
            .first()
            .click();
        cy.wait(250);

        cy.dataCy('delete-branch')
            .first()
            .click({ force: true });
        cy.dataCy('confirm-yes')
            .click({ force: true });
        cy.dataCy('single-story-editor').should('have.length', 1);
        cy.dataCy('branch-label').first().click({ force: true });
        cy.dataCy('single-story-editor').should('have.length', 2);
        
        cy.dataCy('single-story-editor').should('have.length', 2);
        cy.dataCy('single-story-editor').first().contains('- intent: aaa');
        cy.dataCy('single-story-editor').last().contains('- intent: bbb');
    });

    it('should save branch title on blur and Enter', function() {
        cy.dataCy('create-branch').click({ force: true });

        // test Enter
        clickFirstBranchTitle();
        cy.dataCy('branch-label')
            .first()
            .find('input')
            .click()
            .clear()
            .type(`${newBranchNameOne}{Enter}`);
        cy.dataCy('branch-title-input', null, `[value="${newBranchNameOne}"]`)
            .should('exist');

        // test blur
        clickFirstBranchTitle();
        cy.dataCy('branch-label')
            .first()
            .find('input')
            .click()
            .clear()
            .type(`${newBranchNameTwo}`)
            .blur();
        cy.dataCy('branch-title-input', null, `[value="${newBranchNameTwo}"]`)
            .should('exist');
    });

    it('should append the contents of the last branch when the second last branch is deleted', function () {
        // create 2 levels of branches
        cy.dataCy('create-branch')
            .click();
        cy.dataCy('branch-label')
            .should('exist');
        cy.dataCy('create-branch')
            .click();
        // add a user utterance to each open branch
        addBlock(0);
        addBlock(1);
        addBlock(2);
        // delete one of the branches at index 2
        getBranchContainer(1)
            .findCy('branch-label')
            .last()
            .click({ force: true });
        getBranchContainer(1)
            .findCy('branch-label')
            .last()
            .should('have.class', 'active');
        getBranchContainer(1)
            .findCy('branch-label')
            .last()
            .trigger('mouseover');
        cy.dataCy('delete-branch')
            .last()
            .click({ force: true });
        cy.dataCy('confirm-yes')
            .click({ force: true });
        cy.dataCy('delete-branch')
            .last()
            .click({ force: true });
        cy.dataCy('confirm-yes')
            .click({ force: true });
        // the branches at index 2 should have been removed
        cy.dataCy('branch-menu')
            .should('not.exist');
    });
});
