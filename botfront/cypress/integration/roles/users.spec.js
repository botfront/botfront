/* global cy:true */

describe('users:r can not edit user data', () => {
    before(() => {
        cy.removeDummyRoleAndUser();
        cy.wait(2000);
        cy.createDummyRoleAndUser({ permission: ['users:r'] });
    });

    beforeEach(() => {
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login({ admin: false }));
    });
    afterEach(() => {
        cy.logout();
        cy.deleteProject('bf');
    });

    after(() => {
        cy.logout();
        cy.deleteProject('bf');
        cy.removeDummyRoleAndUser();
    });
    it('should not show edit features in the users page', () => {
        cy.visit('/admin');
        cy.dataCy('users-link').click({ force: true });
        cy.dataCy('edit-user').first().click();
        cy.get('.disabled.required.field').should('have.length', 6); // check ALL fields are disabled
        cy.dataCy('save-user').should('not.exist');
        cy.get('.ui.pointing.secondary.menu').children().should('have.length', 1); // Change password and Delete user should be hidden
    });
});

describe('visibility of the Users link in the admin sidebar', () => {
    before(() => {
        cy.removeDummyRoleAndUser();
        cy.wait(2000);
        cy.createDummyRoleAndUser({ permission: ['projects:w'] });
    });

    beforeEach(() => {
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login({ admin: false }));
    });
    afterEach(() => {
        cy.logout();
        cy.deleteProject('bf');
    });

    after(() => {
        cy.logout();
        cy.deleteProject('bf');
        cy.removeDummyRoleAndUser();
    });
    it('the "Users" link is hidden in the admin sidebar when the user does not have users:r permission', () => {
        cy.visit('/admin');
        cy.dataCy('users-link').should('not.exist');
    });
});
