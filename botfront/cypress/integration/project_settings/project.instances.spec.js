/* eslint-disable no-undef */

describe('Project Instances', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });

    beforeEach(function() {
        cy.login();
    });

    describe('Instances', function() {
        it('should be able to create instance', function() {
            cy.visit(`/project/${this.bf_project_id}/settings`);
            cy.contains('Instances').click();
            cy.contains('New instance').click();
            cy.get('[name=name]').type('Test Name');
            cy.get('[data-cy=type-selector] input').type('nlu{enter}');
            cy.get('[name=host]').type('http://localhost:5005');
            cy.get('[data-cy=save-instance]').click();
            cy.get('[data-cy=edit-instance]').should('have.lengthOf', 3);
        });

        it('should be able to edit already created instances', function() {
            cy.visit(`/project/${this.bf_project_id}/settings`);
            cy.contains('Instances').click();
            cy.get('[data-cy=edit-instance]').eq(2).click();
            cy.get('[name=name]').type('{selectAll}{del}New Test Name');
            cy.get('[data-cy=save-instance]').click();
            cy.contains('New Test Name');
        });

        it('should be able to delete an instance', function() {
            cy.visit(`/project/${this.bf_project_id}/settings`);
            cy.contains('Instances').click();
            cy.get('[data-cy=delete-instance]').eq(2).click();
            cy.get('.actions > .primary').click();
            cy.get('[data-cy=edit-instance]').should('have.lengthOf', 2);
        });
    });
});
