/* global cy:true */

describe('projects:r can access but not edit settings', () => {
    beforeEach(() => {
        cy.deleteProject('bf');
        cy.createProject('bf', 'myProject', 'en');
    });
    afterEach(() => {
        cy.removeDummyRoleAndUser();
    });
    it('should be able to access export menu', () => {
        // init
        cy.createDummyRoleAndUser({ permission: ['export:x'] });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/project/bf/settings/import-export');
        cy.dataCy('port-project-menu').children().should('have.length', 1);

        cy.dataCy('export-project-tab').should('exist');
        cy.dataCy('import-project-tab').should('not.exist');
    });
    it('should be able to access import menu', () => {
        // init
        cy.createDummyRoleAndUser({ permission: ['import:x'] });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/project/bf/settings/import-export');
        cy.dataCy('port-project-menu').children().should('have.length', 1);

        cy.dataCy('import-project-tab').should('exist');
        cy.dataCy('export-project-tab').should('not.exist');
    });
    it('should not be able to acces import export page', () => {
        // init
        cy.createDummyRoleAndUser({ permission: ['stories:r'] });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/project/bf/settings/import-export');
        cy.url().should('include', '/403');
    });
    it('should be able access both import and export', () => {
        // init
        cy.createDummyRoleAndUser({ permission: ['import:x', 'export:x'] });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/project/bf/settings/import-export');
        cy.dataCy('port-project-menu').children().should('have.length', 2);

        cy.dataCy('import-project-tab').should('exist');
    });
});
