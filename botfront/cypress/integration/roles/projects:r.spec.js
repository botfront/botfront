/* global cy:true */

describe('projects:r can access but not edit settings', () => {
    beforeEach(() => {
        cy.deleteProject('bf');
        cy.createProject('bf', 'myProject', 'en').then(() => {
            cy.login();
        });
    });
    it('should view and not edit project info', () => {
        cy.visit('/project/bf/settings');
        cy.get('.project-name').find('input').should('have.value', 'newName');
        cy.dataCy('language-selector').contains('english').should('exist');
    });
    it('should view and not edit credentials', () => {
        cy.visit('/project/bf/settings');
        cy.get('.project-name').find('input').should('have.value', 'newName');
        cy.dataCy('language-selector').contains('english').should('exist');
    });
});
