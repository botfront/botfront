/* eslint-disable no-undef */

describe('nlu-viewer test', function() {
    before(function() {
        cy.login();
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });

    // it('creating a nlu-viewer', function() {
    //     cy.visit('admin/users');
    //     cy.get('[data-cy=new-user]').click();
    //     cy.get('#uniforms-0000-0001').type('test');
    //     cy.get('#uniforms-0000-0003').type('viewer');
    //     cy.get('#uniforms-0000-0005').type('viewer@test.com');
    //     cy.contains('Select a project').click();
    //     cy.get('[role=listbox]').first().contains('Duedix').click();
    //     cy.contains('Select roles').click();
    //     cy.get('[role=listbox]').eq(1).contains('nlu-viewer').click();
    //     cy.get('.ui.primary.button').click();
    // });

    // it('Adding password for viewer', function() {
    //     cy.visit('admin/users');
    //     cy.contains('viewer').click();
    //     cy.contains('Password change').click();
    //     cy.get('#uniforms-0001-0001').type('Aaaaaaaa00');
    //     cy.get('#uniforms-0001-0003').type('Aaaaaaaa00');
    //     cy.get('[data-cy=change-password]').click();
    // });

    it('Test viewer role', function() {
        cy.logout();
        cy.loginViewer();
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=settings-in-model]').click();
        cy.contains('Pipeline').click();
        cy.get(':checkbox').should('be.checked');
    });
});
