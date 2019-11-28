/* global cy:true */

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

    it('should remember the selected story group when a story group is selected by creating a story group', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.dataCy('browser-item').contains(storyGroupOne).parent().should('have.class', 'selected-blue');
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupTwo}{enter}`);
        cy.dataCy('browser-item').contains(storyGroupTwo).parent().should('have.class', 'selected-blue');
        cy.contains('NLU').click({ force: true });
        cy.contains('Stories').click({ force: true });
        cy.wait(200);
        cy.dataCy('browser-item').contains(storyGroupTwo).parent().should('have.class', 'selected-blue');
    });
    it('should remember the last story group clicked', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.dataCy('browser-item').contains(storyGroupOne).parent().should('have.class', 'selected-blue');
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupTwo}{enter}`);
        cy.dataCy('browser-item').contains(storyGroupTwo).parent().should('have.class', 'selected-blue');
        cy.dataCy('browser-item').contains(storyGroupOne).click();
        cy.dataCy('browser-item').contains(storyGroupOne).parent().should('have.class', 'selected-blue');
        cy.contains('NLU').click({ force: true });
        cy.contains('Stories').click({ force: true });
        cy.wait(200);
        cy.dataCy('browser-item').contains(storyGroupOne).parent().should('have.class', 'selected-blue');
    });
});
