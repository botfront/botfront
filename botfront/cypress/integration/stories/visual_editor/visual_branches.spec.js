/* global cy */

const getBranchContainer = (depth) => {
    /*
    gets the contents of a branch including contents of following branches
    and branch menus. this does not include the specified branches branch-menu
    */
    let branch = cy.dataCy('single-story-editor').first();
    for (let i = 0; i < depth; i += 1) {
        branch = branch.find('[data-cy=single-story-editor]').first();
    }
    return branch;
};

// get the contents of the visual editor for a branch
const getBranchEditor = depth => getBranchContainer(depth).find('.story-visual-editor').first();

const addBlock = (depth) => {
    /*
    adds a user utterance to a story at a branch depth
    (depth = 0 creates an utterance in the origin story)
    */
    getBranchEditor(depth)
        .findCy('add-user-line')
        .click({ force: true });
    getBranchEditor(depth)
        .findCy('user-line-from-input')
        .last()
        .click({ force: true });
    getBranchEditor(depth)
        .findCy('utterance-input')
        .find('input')
        .type('I love typing into boxes.{enter}');
    cy.dataCy('intent-label').should('have.length', depth + 1);
    getBranchEditor(depth)
        .findCy('intent-label')
        .click({ force: true })
        .type('myTestIntent{enter}');
    cy.dataCy('save-new-user-input')
        .click({ force: true });
    cy.dataCy('save-new-user-input').should('not.exist');
};

describe('story visual editor', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
        cy.visit('/project/bf/dialogue');
        cy.createStoryGroup();
        cy.createStoryInGroup();
    });
    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('should append the contents of the last branch when the second last branch is deleted', function () {
        cy.wrap([]).as('intent-labels'); // initial intent-labels
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
