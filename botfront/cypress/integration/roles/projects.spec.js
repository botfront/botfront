/* global cy:true */

describe('projects:r can access but not edit settings', () => {
    beforeEach(() => {
        cy.deleteProject('bf');
        cy.createProject('bf', 'myProject', 'en');
    });
    it('should be able to view a read only version of all project settings tabs as projects:r', () => {
        // init
        cy.removeDummyRoleAndUser('test@test.test', 'projects:r');
        cy.wait(2000);
        cy.createDummyRoleAndUser({ permission: ['projects:r'] });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/project/bf/settings');
        // project info tab
        cy.get('.project-name').find('input').should('have.value', 'myProject');
        cy.dataCy('language-selector').should('have.class', 'disabled');
        cy.dataCy('deployment-evironments').should('not.exist');
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
        cy.dataCy('ace-field').should('not.exist');
        cy.dataCy('url-field').should('have.class', 'disabled');
        cy.dataCy('save-button').should('not.exist');
        // instances tab
        cy.dataCy('project-settings-menu-instances').should('not.exist');
        // remove test user
        cy.removeDummyRoleAndUser();
    });
    it('should be able to view a write-able version of all project settings tabs as projects:w', () => {
        // init
        cy.removeDummyRoleAndUser();
        cy.wait(2000);
        cy.createDummyRoleAndUser({ permission: ['projects:w'] });
        cy.wait(2000);
        cy.login({ admin: false });
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
        cy.dataCy('url-field').should('exist');
        cy.dataCy('ace-field').should('not.exist');
        cy.dataCy('save-button').should('exist');
        // remove user
        cy.removeDummyRoleAndUser('test@test.test', 'projects:w');
    });
    it('should only show the settings side menu link for projects:r', () => {
        cy.removeDummyRoleAndUser('test@test.test', 'users:r');
        cy.wait(2000);
        cy.createDummyRoleAndUser({ permission: ['stories:r'], scope: 'bf' });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/project/bf/stories');
        // check non authorized users cannot see the projects tab
        cy.dataCy('stories-sidebar-link').should('exist');
        cy.dataCy('settings-sidebar-link').should('not.exist');
        cy.removeDummyRoleAndUser();
    });
    it('should only show the projects side menu link for projects:r GLOBAL scope', () => {
        cy.removeDummyRoleAndUser('test@test.test', 'users:r');
        cy.wait(2000);
        cy.createDummyRoleAndUser({ permission: ['users:r'], scope: 'GLOBAL' });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/admin');
        // check non authorized users cannot see the projects tab
        cy.dataCy('users-link').should('exist');
        cy.dataCy('projects-link').should('not.exist');
        cy.removeDummyRoleAndUser();
    });
    it('should be able to view but not edit projects as projects:r GLOBAL scope', () => {
        cy.removeDummyRoleAndUser();
        cy.wait(2000);
        cy.createDummyRoleAndUser({ permission: ['projects:r'], scope: 'GLOBAL' });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/admin');
        // check authorized users can view projects
        cy.dataCy('projects-link').click();
        cy.get('.header').contains('Projects');
        cy.get('.rt-td').contains('Chitchat').should('exist');
        cy.dataCy('edit-projects').should('not.exist');
        cy.dataCy('new-project').should('not.exist');
        cy.removeDummyRoleAndUser();
    });
    it('should be able to edit projects with projects:w GLOBAL scope', () => {
        cy.removeDummyRoleAndUser();
        cy.wait(2000);
        cy.createDummyRoleAndUser({ permission: ['projects:w'], scope: 'GLOBAL' });
        cy.wait(2000);
        cy.login({ admin: false });
        cy.visit('/admin');
        // check authorized users can view projects
        cy.dataCy('projects-link').click();
        cy.get('.rt-td').contains('Chitchat').should('exist');
        cy.dataCy('new-project').should('exist');
        cy.dataCy('edit-projects').first().click();
        cy.dataCy('submit-field').should('exist');
        // remove user
        cy.removeDummyRoleAndUser();
    });
});
