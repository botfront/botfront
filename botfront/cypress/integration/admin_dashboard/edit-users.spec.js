/* eslint-disable no-undef */

describe('incoming page', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
    });

    afterEach(function() {
        cy.logout();
        cy.deleteUser('testdelete@bf.com');
        cy.deleteProject('bf');
    });

    it('should be able to delete a user', function() {
        cy.visit('/admin/users');
        cy.dataCy('new-user')
            .click();
        cy.get('input')
            .first()
            .type('testDelete{enter}');
        cy.get('input')
            .eq(1)
            .type('testDelete{enter}');
        cy.get('input')
            .eq(2)
            .type('testdelete@bf.com{enter}');
        cy.get('.search')
            .contains('Select a project')
            .click();
        cy.get('.item')
            .contains('GLOBAL')
            .click({ force: true });
        cy.get('.search')
            .contains('Select roles')
            .click();
        cy.get('.item')
            .contains('global-admin')
            .click({ force: true });
        cy.get('.ui.form')
            .find('.ui.primary.button')
            .click();
        cy.get('.edit')
            .last()
            .click();
        cy.contains('User deletion')
            .click();
        cy.get('.negative.button')
            .click();
        cy.get('.dimmer.visible')
            .find('.ui.button')
            .contains('OK')
            .click();
        cy.dataCy('new-user')
            .should('exist');
        cy.contains('testDelete')
            .should('not.exist');
    });
});
