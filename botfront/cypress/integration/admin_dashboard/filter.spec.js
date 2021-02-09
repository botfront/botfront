/* eslint-disable no-undef */
describe('filter', function() {
    before(function() {
        cy.createProject('bf', 'Duedix', 'fr');
    });

    after(function() {
        cy.deleteProject('bf');
    });

    it('project filters', function() {
        cy.visit('/admin/projects');
        cy.get('.rt-tr > :nth-child(1) > input')
            .click()
            .type('dix');
        cy.contains('Duedix').should('exist');
        cy.contains('ChitChat').should('not.exist');
    });

    it('user filters', function() {
        cy.login();
        cy.visit('/admin/users');
        cy.get('.rt-tr > :nth-child(1) > input')
            .click()
            .type('mc');
        cy.contains('McTest').should('exist');
        cy.get('.rt-tr > :nth-child(1) > input')
            .click()
            .type('{backspace}{backspace}');

        cy.get('.rt-tr > :nth-child(2) > input')
            .click()
            .type('mc');
        cy.contains('McTest').should('not.exist');
        cy.get('.rt-tr > :nth-child(2) > input')
            .click()
            .type('{backspace}{backspace}');

        cy.get('.rt-tr > :nth-child(3) > input')
            .click()
            .type('test');
        cy.contains('McTest').should('exist');
    });
});
