/* eslint-disable no-undef */

const storyGroupOne = 'storyGroupOne';
const storyGroupTwo = 'storyGroupTwo';

describe('stories state persisting', function() {
    afterEach(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
    });

    // function clickStoryGroup(group) {
    //     const positions = ['topLeft', 'top', 'topRight', 'left', 'center', 'right', 'bottomLeft', 'bottom', 'bottomRight'];
    //     positions.map(p => cy.contains(group).click(p, { force: true }));
    // }

    it('should remember the last story group clicked', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupTwo}{enter}`);
        cy.wait(500);
        cy.contains('NLU').click({ force: true });
        cy.contains('Stories').click({ force: true });
        cy.get('[data-cy=browser-item].active.item').contains(storyGroupTwo);
    });
});
