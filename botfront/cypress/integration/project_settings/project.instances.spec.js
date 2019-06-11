/* eslint-disable no-undef */

describe('Project Instances', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });

    beforeEach(function() {
        cy.login();
    });

    describe('Instances', function() {
        it('should be able to edit already created instances', function() {
            cy.visit(`/project/${this.bf_project_id}/settings`);
            cy.contains('Instances').click();
            cy.get('[data-cy=edit-instance]').eq(0).click();
            cy.get('[name=name]').type('{selectAll}{del}New Test Name');
            cy.get('[data-cy=save-instance]').click();
            cy.contains('New Test Name');
        });
    });
});
