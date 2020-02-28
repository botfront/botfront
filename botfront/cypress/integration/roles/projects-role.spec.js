/* global cy:true */

describe('projects:r can access but not edit settings', () => {
    beforeEach(() => {
        cy.deleteProject('bf');
        cy.createProject('bf', 'myProject', 'en');
    });
    it('should be able to view a read only version of all project settings tabs', () => {
        // init
        cy.removeDummyRoleAndUser('test@test.test', 'projects:r');
        cy.wait(2000);
        cy.createDummyRoleAndUserThenLogin('test@test.test', ['projects:r']);
        cy.wait(2000);
        cy.visit('/project/bf/settings');
        // project info tab
        cy.get('.project-name').find('input').should('have.value', 'myProject');
        cy.dataCy('language-selector').should('have.class', 'disabled');
        cy.dataCy('save-button').should('not.exist');
        // credentials tab
        cy.dataCy('project-settings-menu-credentials').click();
        cy.dataCy('ace-field').should('have.class', 'disabled');
        cy.dataCy('save-button').should('not.exist');
        // default domain tab
        cy.dataCy('project-settings-menu-default-domain').click();
        cy.dataCy('ace-field').should('have.class', 'disabled');
        cy.dataCy('save-button').should('not.exist');
        // import export tab
        cy.dataCy('project-settings-menu-import-export').click();
        cy.dataCy('port-project-menu').children('.item').should('have.length', 1);
        cy.dataCy('port-project-menu').find('.item').first().should('have.text', 'Export');
        // endpoints tab
        cy.dataCy('project-settings-menu-endpoints').click();
        cy.dataCy('ace-field').should('have.class', 'disabled');
        cy.dataCy('save-button').should('not.exist');
        // instances tab
        cy.dataCy('project-settings-menu-instances').click();
        cy.get('.field').should('have.class', 'disabled');
        cy.dataCy('save-instance').should('not.exist');
        // remove test user
        cy.removeDummyRoleAndUser('test@test.test', 'projects:w');
    });
    it('should be able to view a read only version of all project settings tabs', () => {
        // init
        cy.removeDummyRoleAndUser('test@test.test', 'projects:w');
        cy.wait(2000);
        cy.createDummyRoleAndUserThenLogin('test@test.test', ['projects:w']);
        cy.wait(2000);
        cy.visit('/project/bf/settings');
        // project info tab
        cy.dataCy('language-selector').should('not.have.class', 'disabled');
        cy.dataCy('save-changes').should('exist');
        // credentials tab
        cy.dataCy('project-settings-menu-credentials').click();
        cy.dataCy('ace-field').should('not.have.class', 'disabled');
        cy.dataCy('save-button').should('exist');
        // default domain tab
        cy.dataCy('project-settings-menu-default-domain').click();
        cy.dataCy('ace-field').should('not.have.class', 'disabled');
        cy.dataCy('save-button').should('exist');
        // import export tab
        cy.dataCy('project-settings-menu-import-export').click();
        cy.dataCy('port-project-menu').children('.item').should('have.length', 2);
        // endpoints tab
        cy.dataCy('project-settings-menu-endpoints').click();
        cy.dataCy('ace-field').should('not.have.class', 'disabled');
        cy.dataCy('save-button').should('exist');
        // instances tab
        cy.dataCy('project-settings-menu-instances').click();
        cy.get('.field').should('not.have.class', 'disabled');
        cy.dataCy('save-instance').should('exist');
        // remove user
        cy.removeDummyRoleAndUser('test@test.test', 'projects:w');
    });
});
