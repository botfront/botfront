/* global cy:true */

describe('users:r can access but not edit user data', () => {
    before(() => {
        cy.removeDummyRoleAndUser();
        cy.deleteProject('bf');
        cy.wait(2000);
        cy.createProject('bf', 'My Project', 'en');
        cy.createDummyRoleAndUser({ permission: ['users:r'] });
    });

    beforeEach(() => cy.login({ admin: false }));

    after(() => {
        cy.deleteProject('bf');
        cy.removeDummyRoleAndUser();
    });
    it('should be able to view a read only version of all project settings tabs as projects:r', () => {
        cy.visit('/admin');
        cy.dataCy('users-link').click({ force: true });
        cy.dataCy('edit-user').first().click();
        cy.get('.disabled.required.field').should('have.length', 6); // check ALL fields are disabled
        cy.dataCy('save-user').should('not.exist');
        cy.get('.ui.pointing.secondary.menu').children().should('have.length', 1); // Change password and Delete user should be hidden
    });
});


describe('users:w can edit user data', () => {
    before(() => {
        cy.removeDummyRoleAndUser();
        cy.deleteProject('bf');
        cy.wait(2000);
        cy.createProject('bf', 'My Project', 'en');
        cy.createDummyRoleAndUser({ permission: ['users:w'] });
    });

    beforeEach(() => cy.login({ admin: false }));

    after(() => {
        cy.deleteProject('bf');
        cy.removeDummyRoleAndUser();
    });
    it('should be able to view a read only version of all project settings tabs as projects:r', () => {
        cy.visit('/admin');
        cy.dataCy('users-link').click({ force: true });
        cy.dataCy('edit-user').first().click();
        cy.get('.disabled.required.field').should('have.length', 0); // check ALL fields are not disabled
        cy.dataCy('save-user').should('exist');
        cy.get('.ui.pointing.secondary.menu').children().should('have.length', 3); // can view all menu tabs
    });
});
