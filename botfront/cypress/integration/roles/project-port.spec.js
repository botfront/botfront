/* global cy:true */

describe('projects:r can access but not edit settings', () => {
    beforeEach(() => {
        cy.deleteProject('bf');
        cy.createProject('bf', 'myProject', 'en');
    });
    afterEach(() => {
        cy.removeDummyRoleAndUser();
    });
    it('should be able to view a read only version of all project settings tabs as projects:r', () => {
        // init
        cy.createDummyRoleAndUser({ permission: ['export:x', 'resources:r'] });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/project/bf/settings/import-export');

        cy.dataCy('export-type-dropdown').click();
        cy.dataCy('export-type-dropdown').find('div').contains('Export for Botfront').click({ force: true });
        cy.dataCy('export-option').eq(1).should('not.have.class', 'disabled');
        cy.dataCy('export-option').eq(2).should('not.have.class', 'disabled');
        cy.dataCy('export-option').eq(3).should('not.have.class', 'disabled');
        cy.dataCy('export-option').eq(4).should('not.have.class', 'disabled');
        
        cy.dataCy('import-project-tab').should('not.exist');
    });
    it('should be able to view a read only version of all project settings tabs as projects:r', () => {
        // init
        cy.createDummyRoleAndUser({ permission: ['export:x', 'stories:r'] });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/project/bf/settings/import-export');
        cy.dataCy('export-type-dropdown').click();
        cy.dataCy('export-type-dropdown').find('div').contains('Export for Botfront').click({ force: true });
        cy.dataCy('export-option').eq(1).should('have.class', 'disabled');
        cy.dataCy('export-option').eq(2).should('have.class', 'disabled');
        cy.dataCy('export-option').eq(3).should('have.class', 'disabled');
        cy.dataCy('export-option').eq(4).should('have.class', 'disabled');
    });
    it('should be able to view a read only version of all project settings tabs as projects:r', () => {
        // init
        cy.createDummyRoleAndUser({ permission: ['export:x', 'stories:r', 'incoming:r'] });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/project/bf/settings/import-export');

        cy.dataCy('export-type-dropdown').click();
        cy.dataCy('export-type-dropdown').find('div').contains('Export for Botfront').click({ force: true });
        cy.dataCy('export-option').eq(1).should('not.have.class', 'disabled');
        cy.dataCy('export-option').eq(2).should('have.class', 'disabled');
        cy.dataCy('export-option').eq(3).should('have.class', 'disabled');
        cy.dataCy('export-option').eq(4).should('have.class', 'disabled');
    });
    it('should be able to view a read only version of all project settings tabs as projects:r', () => {
        // init
        cy.createDummyRoleAndUser({ permission: ['import:x', 'stories:w', 'incoming:w'] });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/project/bf/settings/import-export');
        cy.dataCy('import-project-tab').should('exist');
    });
});
