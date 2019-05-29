/* eslint-disable no-undef */

const email = 'responsesw@test.ia';

describe('responses:w role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('responses:w', email, ['responses:w'], id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.deleteUser(email);
        cy.removeTestResponse(this.bf_project_id);
    });

    it('should not display forbidden options', function() {
        cy.addTestResponse(this.bf_project_id);
        cy.visit('/');
        cy.get('[data-cy=add-bot-response]');
        cy.contains('Import/Export');
        cy.get('[data-cy=edit-response-0]');
        cy.get('[data-cy=remove-response-0]').click();
        cy.get('[data-cy=remove-response-0]').should('not.exist');
        cy.visit(`/project/${this.bf_project_id}/dialogue/templates/add`);
        cy.url().should('not.include', '403');
    });

    it('should be able to call allowed methods', function() {
        cy.addTestResponse(this.bf_project_id);
        cy.MeteorCall('project.deleteTemplate', [
            this.bf_project_id,
            'utter_greet',
        ]).then(res => expect(res).to.equal(1));
    });
});
