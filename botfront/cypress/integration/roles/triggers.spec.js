/* eslint-disable no-undef */
// example file to demonstrate cypress commands for roles
const email = 'test@test.test';

describe('Permission on the trigger rules modal', function() {
    beforeEach(function() {
        cy.login();
        cy.createProject('bf', 'My Project', 'fr');
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('should be abe able to edit triggers', function() {
        cy.createDummyRoleAndUserThenLogin(email, ['triggers:w']);
        cy.visit('/project/bf/stories');
        cy.dataCy('edit-trigger-rules').click();
        cy.get('div.modal div.grouped.fields').should('not.have.class', 'disabled');
        cy.dataCy('delete-triggers').should('exist');
        cy.dataCy('submit-triggers').should('exist');
        cy.removeDummyRoleAndUser(email, 'global-admin');
    });

    it('should not be abe able to edit triggers', function() {
        cy.createDummyRoleAndUserThenLogin(email, ['triggers:r']);
        cy.visit('/project/bf/stories');
        cy.dataCy('edit-trigger-rules').click();
        cy.get('div.modal div.grouped.fields').should('have.class', 'disabled');
        cy.dataCy('delete-triggers').should('not.exist');
        cy.dataCy('submit-triggers').should('not.exist');
        cy.removeDummyRoleAndUser(email, 'global-admin');
    });
});
