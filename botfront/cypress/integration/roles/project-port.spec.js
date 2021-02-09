/* global cy:true */

const unlockGitDropdown = () => {
    // button won't show unless git is set up in project settings
    // so this fn can be used as admin to set it up fast
    cy.import('bf', 'dummy-git-settings/bfconfig.yml');
};

describe('import:x, export:x roles', () => {
    beforeEach(() => {
        cy.deleteProject('bf');
        cy.createProject('bf', 'myProject', 'en');
    });
    afterEach(() => {
        cy.removeDummyRoleAndUser();
    });
    it('should be able to access export menu', () => {
        // init
        cy.createDummyRoleAndUser({ permission: ['stories:r', 'export:x'] });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/project/bf/settings/import-export');
        cy.dataCy('port-project-menu').children().should('have.length', 1);

        cy.dataCy('export-project-tab').should('exist');
        cy.dataCy('import-project-tab').should('not.exist');
    });
    it('should be able to access import menu, and show git menu', () => {
        unlockGitDropdown();
        cy.createDummyRoleAndUser({ permission: ['stories:r', 'import:x'] });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/project/bf/settings/import-export');
        cy.dataCy('port-project-menu').children().should('have.length', 1);

        cy.dataCy('import-project-tab').should('exist');
        cy.dataCy('export-project-tab').should('not.exist');

        cy.visit('/project/bf/dialogue');
        cy.dataCy('stories-search-bar').should('exist');
        cy.dataCy('git-dropdown').should('exist');
    });
    it('should not be able to acces import export page, or show git menu', () => {
        unlockGitDropdown();
        cy.createDummyRoleAndUser({ permission: ['stories:r'] });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/project/bf/settings/import-export');
        cy.url().should('include', '/403');

        cy.visit('/project/bf/dialogue');
        cy.dataCy('stories-search-bar').should('exist');
        cy.dataCy('git-dropdown').should('not.exist');
    });
    it('should be able access both import and export', () => {
        // init
        cy.createDummyRoleAndUser({ permission: ['stories:r', 'import:x', 'export:x'] });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/project/bf/settings/import-export');
        cy.dataCy('port-project-menu').children().should('have.length', 2);

        cy.dataCy('import-project-tab').should('exist');
    });
});
