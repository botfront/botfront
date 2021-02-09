/* eslint-disable no-undef */

describe('should not get 404s for default routes', () => {
    beforeEach(() => {
        cy.removeDummyRoleAndUser();
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en');
        cy.logout();
    });
    afterEach(() => {
        cy.logout();
        cy.removeDummyRoleAndUser();
        cy.deleteProject('bf');
    });
    it('roles:r/w default route', () => {
        cy.createDummyRoleAndUser({ permission: ['roles:r'] });
        cy.login({ admin: false });
        cy.visit('/');
        cy.get('.vertical.menu').should('exist');
        cy.get('.header').contains('Roles').should('exist');
        cy.url().should('include', '/admin/roles');
    });
    it('users:r/w default route', () => {
        cy.createDummyRoleAndUser({ permission: ['users:r'] });
        cy.login({ admin: false });
        cy.visit('/');
        cy.get('.vertical.menu').should('exist');
        cy.get('.header').contains('Users').should('exist');
        cy.url().should('include', '/admin/users');
    });
    it('projects:r/w global default', () => {
        cy.createDummyRoleAndUser({ permission: ['projects:r'], scope: 'GLOBAL' });
        cy.login({ admin: false });
        cy.visit('/');
        cy.get('.ui.top-menu').should('exist');
        cy.get('.header').contains('Projects').should('exist');
        cy.url().should('include', '/admin/projects');
    });
    it('projects:r/w scoped default', () => {
        cy.createDummyRoleAndUser({ permission: ['projects:r'], scope: 'bf' });
        cy.login({ admin: false });
        cy.visit('/');
        cy.get('.ui.top-menu').should('exist');
        cy.get('.header').contains('Stories').should('exist');
        cy.url().should('include', '/project/bf/dialogue');
    });
    it('global-settings:r/w global default', () => {
        cy.createDummyRoleAndUser({ permission: ['global-settings:r'] });
        cy.login({ admin: false });
        cy.visit('/');
        cy.get('.ui.top-menu').should('exist');
        cy.get('.header').contains('Global Settings').should('exist');
        cy.url().should('include', '/admin/settings');
    });
    it('stories:r/w global default', () => {
        cy.createDummyRoleAndUser({ permission: ['stories:r'] });
        cy.login({ admin: false });
        cy.visit('/');
        cy.get('.ui.top-menu').should('exist');
        cy.get('.header').contains('Stories').should('exist');
        cy.url().should('include', '/project/bf/dialogue');
    });
    it('responses:r/w global default', () => {
        cy.createDummyRoleAndUser({ permission: ['responses:r'] });
        cy.login({ admin: false });
        cy.visit('/');
        cy.get('.ui.top-menu').should('exist');
        cy.get('.header').contains('Bot responses').should('exist');
        cy.url().should('include', '/project/bf/responses');
    });
    it('nludata:r/w global default', () => {
        cy.createDummyRoleAndUser({ permission: ['nlu-data:r'] });
        cy.login({ admin: false });
        cy.visit('/');
        cy.dataCy('nlu-menu-training-data').should('exist');
        cy.url().should('include', '/project/bf/nlu/model');
    });
    it('analytics:r global default', () => {
        cy.createDummyRoleAndUser({ permission: ['analytics:r'] });
        cy.login({ admin: false });
        cy.visit('/');
        cy.get('.ui.top-menu').should('exist');
        cy.get('.header').contains('Stories').should('exist');
        cy.url().should('include', '/project/bf/dialogue');
    });
    it('incoming:r default', () => {
        cy.createDummyRoleAndUser({ permission: ['incoming:r'] });
        cy.login({ admin: false });
        cy.visit('/');
        cy.get('.ui.top-menu').should('exist');
        cy.get('.header').contains('Stories').should('exist');
        cy.url().should('include', '/project/bf/dialogue');
    });
});
