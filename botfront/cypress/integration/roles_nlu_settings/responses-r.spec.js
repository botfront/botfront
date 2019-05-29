/* eslint-disable no-undef */

const email = 'responsesr@test.ia';

describe('responses:r role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('responses:r', email, ['responses:r'], id);
            cy.addTestResponse(id);
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

    it('should display the right items in the sidebar', function() {
        cy.visit('/');
        cy.get('[data-cy=project-menu]').then((sidebar) => {
            cy.wrap(sidebar).contains('Responses');
            cy.wrap(sidebar).contains('NLU').should('not.exist');
            cy.wrap(sidebar).contains('Conversations').should('not.exist');
            cy.wrap(sidebar).contains('Settings').should('not.exist');
        });
    });

    it('should not display forbidden options', function() {
        cy.visit('/');
        cy.get('[data-cy=responses-screen]');
        cy.get('[data-cy=add-bot-response]').should('not.exist');
        cy.contains('Import/Export').should('not.exist');
        cy.get('[data-cy=remove-response-0]').should('not.exist');
        cy.get('[data-cy=edit-response-0]').should('not.exist');
        cy.visit(`/project/${this.bf_project_id}/dialogue/templates/add`);
        cy.url().should('include', '403');
    });

    it('should not be able to call forbidden methods', function() {
        cy.MeteorCall('project.deleteTemplate', [
            this.bf_project_id,
            'a key',
        ]).then(err => expect(err.error).to.equal('403'));
        cy.MeteorCall('project.insertTemplate', [
            this.bf_project_id,
            {
                an: 'item',
            },
        ]).then(err => expect(err.error).to.equal('403'));
        cy.MeteorCall('templates.removeByKey', [
            this.bf_project_id,
            'a key',
        ]).then(err => expect(err.error).to.equal('403'));
    });
});
