/* global cy */

describe('Permission on the trigger rules modal', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr');
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('should not be abe able to edit triggers', function() {
        cy.createDummyRoleAndUser({ permission: ['triggers:r'] });
        cy.login({ admin: false });
        cy.visit('/project/bf/stories');
        cy.browseToStory('Get started');
        cy.dataCy('edit-trigger-rules').click();
        cy.get('div.modal div.grouped.fields').should('have.class', 'disabled');
        cy.dataCy('delete-triggers').should('not.exist');
        cy.dataCy('submit-triggers').should('not.exist');
        cy.logout().then(() => cy.login()); // login as admin
        cy.removeDummyRoleAndUser();
    });
});
