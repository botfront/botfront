/* eslint-disable no-undef */

const email = 'projectreader@test.ia';

describe('project reader role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('projectreader', email, ['project-settings:r'], id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.deleteUser(email);
    });

    it('should NOT be able to change project info', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Project Info').click();
        cy.get('.project-name').should('have.class', 'disabled');
        cy.get('.project-default-language').should('have.class', 'disabled');

        // For meteor call
        cy.MeteorCall('project.update', [
            {
                name: 'My First Model',
                _id: this.bf_project_id,
                defaultLanguage: 'en',
            },
        ]).then((result) => {
            expect(result.error).to.be.equals('403');
        });
    });

    it('should NOT be able to change rules', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Rules').click();
        cy.get('[data-cy=ace-field]').should('have.class', 'disabled');
        cy.get('[data-cy=save-button]').should('be.disabled');

        cy.MeteorCall('rules.save', [
            {
                projectId: this.bf_project_id,
                rules: 'RULE',
            },
        ]).then((result) => {
            expect(result.error).to.be.equals('403');
        });
    });
});
