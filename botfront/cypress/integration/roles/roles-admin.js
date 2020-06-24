/* eslint-disable no-undef */

describe('roles permissions', () => {
    before(() => {
        cy.createProject('bf', 'My Project', 'en');
        cy.createDummyRoleAndUser({ permission: ['roles:r'] });
    });
    beforeEach(() => {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login({ admin: false }));
    });
    afterEach(() => {
        cy.logout();
        cy.deleteProject('bf');
    });
    after(() => {
        cy.logout();
        cy.removeDummyRoleAndUser();
        cy.deleteProject('bf');
    });

    it('should not be able to create new response', () => {
        cy.visit('/admin/roles');
        cy.dataCy('create-role').should('not.exist');
    });

    it('should see list of all roles', () => {
        cy.visit('/admin/roles');
        cy.get('div.rt-td a').should('have.length', 20);
        cy.get('div.-next button.-btn').click();
        cy.get('div.rt-td a').should('have.length', 6); // 5 base roles + 1 dummy role
        cy.visit('/admin/roles');
    });

    it('should see details of a role', () => {
        cy.visit('/admin/roles');
        cy.get('div.-next button.-btn').click();
        cy.contains('dummy').click();
        cy.get('div.required.field').each(elm => cy.wrap(elm).should('have.class', 'disabled'));
        cy.dataCy('save-button').should('not.exist');
        cy.dataCy('delete-role').should('not.exist');
    });
});
