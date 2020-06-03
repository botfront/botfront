/* eslint-disable no-undef */

describe('global settings read permissions', () => {
    before(() => {
        cy.createDummyRoleAndUser({ permission: ['global-settings:r'] });
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

    it('should be able to access global settings through the admin sidebar', () => {
        cy.visit('/admin');
        cy.dataCy('global-settings-link').should('exist');
    });
    
    it('All global settings save buttons should be hidden', () => {
        cy.visit('/admin/settings');
        cy.get('div.ui.vertical.menu a.item').each((item) => {
            cy.wrap(item).click();
            cy.dataCy('save-global-settings').should('not.exist');
        });
    });
    
    it('All global settings input fields should be disabled', () => {
        const simpleDisabledCheck = [
            'Default NLU Pipeline',
            'Default credentials',
            'Default endpoints',
            'Default default domain',
            'Webhooks',
            'Security',
            'Misc',
            'Support',
        ];
        // we check the panes where every single field is disabled
        simpleDisabledCheck.forEach((menu) => {
            cy.visit('/admin/settings');
            cy.contains(menu).click();
            cy.get('div.column div.tab .field').each(field => cy.wrap(field).should('have.class', 'disabled'));
        });

        // check the more panes where not eveything is disabled (eg: label)
        cy.visit('/admin/settings');
        cy.contains('Appearance').click();
        cy.get('div.column div.tab > .field').each(field => cy.wrap(field).should('have.class', 'disabled'));
        cy.get('div.column div.tab > .fields').each(field => cy.wrap(field).should('have.class', 'disabled'));
        cy.visit('/admin/settings');
        cy.contains('GKE settings').click();
        cy.get('div.column div.tab .field .field').each(field => cy.wrap(field).should('have.class', 'disabled'));
        cy.visit('/admin/settings');
    });


    it('should not be able to access project settings from global settings', () => {
        cy.login();
        cy.visit('/admin/settings');
        cy.get('div.ui.vertical.menu a.item').should('have.length', 10);
    });

    it('should not be able to access global settings from project setting', () => {
        cy.login();
        cy.visit('/project/bf/settings');
        cy.dataCy('project-settings-more').should('not.exist');
        cy.get('div.ui.vertical.menu a.item').should('have.length', 7);
    });
});

describe('global settings admin sidebar', () => {
    before(() => {
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
    it('should not be able to access global-settings without global-settings:r', () => {
        cy.visit('/admin');
        cy.dataCy('roles-link').should('exist');
        cy.dataCy('global-settings-link').should('not.exist');
    });
});
