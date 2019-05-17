/* eslint-disable no-undef */

describe('Create the users with respective roles', function() {
    beforeEach(function() {
        cy.login();
        cy.visit('admin/users');
    });

    afterEach(function() {
        cy.logout();
    });

    it('creating a nlu-viewer', function() {
        cy.get('[data-cy=new-user]').click();
        cy.get('#uniforms-0000-0001').type('test');
        cy.get('#uniforms-0000-0003').type('viewer');
        cy.get('#uniforms-0000-0005').type('viewer@test.com');
        cy.contains('Select a project').click();
        cy.get('[role=listbox]').first().contains('Duedix').click();
        cy.contains('Select roles').click();
        cy.get('[role=listbox]').eq(1).contains('nlu-viewer').click();
        cy.get('.ui.primary.button').click();
    });

    it('Adding password for viewer', function() {
        cy.contains('viewer').click();
        cy.contains('Password change').click();
        cy.get('#uniforms-0001-0001').type('Aaaaaaaa00');
        cy.get('#uniforms-0001-0003').type('Aaaaaaaa00');
        cy.get('[data-cy=change-password]').click();
    });

    it('creating a nlu-editor', function() {
        cy.get('[data-cy=new-user]').click();
        cy.get('#uniforms-0000-0001').type('test');
        cy.get('#uniforms-0000-0003').type('editor');
        cy.get('#uniforms-0000-0005').type('editor@test.com');
        cy.contains('Select a project').click();
        cy.get('[role=listbox]').first().contains('Duedix').click();
        cy.contains('Select roles').click();
        cy.get('[role=listbox]').eq(1).contains('nlu-viewer').click();
        cy.get('[role=listbox]').eq(1).contains('nlu-editor').click();
        cy.get('.ui.primary.button').click();
    });

    it('Adding password for editor', function() {
        cy.contains('editor').click();
        cy.contains('Password change').click();
        cy.get('#uniforms-0001-0001').type('Aaaaaaaa00');
        cy.get('#uniforms-0001-0003').type('Aaaaaaaa00');
        cy.get('[data-cy=change-password]').click();
    });

    it('creating a nlu-admin', function() {
        cy.get('[data-cy=new-user]').click();
        cy.get('#uniforms-0000-0001').type('test');
        cy.get('#uniforms-0000-0003').type('admin');
        cy.get('#uniforms-0000-0005').type('admin@test.com');
        cy.contains('Select a project').click();
        cy.get('[role=listbox]').first().contains('Duedix').click();
        cy.contains('Select roles').click();
        cy.get('[role=listbox]').eq(1).contains('nlu-viewer').click();
        cy.get('[role=listbox]').eq(1).contains('nlu-admin').click();
        cy.get('.ui.primary.button').click();
    });

    it('Adding password for admin', function() {
        cy.contains('admin').click();
        cy.contains('Password change').click();
        cy.get('#uniforms-0001-0001').type('Aaaaaaaa00');
        cy.get('#uniforms-0001-0003').type('Aaaaaaaa00');
        cy.get('[data-cy=change-password]').click();
    });
});
