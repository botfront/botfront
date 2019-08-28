/* eslint-disable no-undef */

const storyGroupOne = 'storyGroupOne';

function clickStoryGroup(group) {
    const positions = [
        'topLeft',
        'top',
        'topRight',
        'left',
        'center',
        'right',
        'bottomLeft',
        'bottom',
        'bottomRight',
    ];
    positions.map(p => cy.contains(group).click(p, { force: true }));
}

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

        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        clickStoryGroup(storyGroupOne);
        cy.dataCy('create-branch').click({ force: true });
        cy.dataCy('branch-label').should('have.lengthOf', 2);
        cy.dataCy('story-editor')
            .get('textarea')
            .should('have.lengthOf', 2);
        cy.dataCy('story-editor')
            .get('textarea')
            .eq(1)
            .focus()
            .type('xxx', { force: true });
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click({ force: true });

        clickStoryGroup(storyGroupOne);
        cy.dataCy('branch-label').should('have.lengthOf', 2);
        cy.dataCy('branch-label')
            .first()
            .click({ force: true });
        cy.contains('xxx').should('exist');
    });
});
