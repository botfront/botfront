/* eslint-disable no-undef */

const email = 'projectwriter@test.ia';

describe('project writer role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('projectwriter', email, ['project-settings:w'], id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.deleteUser(email);
        cy.exec(`mongo meteor --host localhost:3001 --eval "db.rules.remove({ rules: 'RULE'});"`);
    });

    it('should be able to change project info', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Project Info').click();
        cy.get('.project-name').should('not.have.class', 'disabled');
        cy.get('.project-default-languge').should('not.have.class', 'disabled');

        // For meteor call
        cy.MeteorCall('project.update', [
            {
                name: 'My First Model',
                _id: this.bf_project_id,
                defaultLanguage: 'en',
            },
        ]).then((result) => {
            expect(result).to.be.equals(1);
        });
    });

    it('should be able to change rules', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Rules').click();
        cy.get('[data-cy=ace-field]').should('not.have.class', 'disabled');
        cy.get('[data-cy=save-button]').should('not.to.be.disabled');

        // For meteor Call
        cy.MeteorCall('rules.save', [
            {
                projectId: this.bf_project_id,
                rules: 'RULE',
            },
        ]).then((result) => {
            expect(result.numberAffected).to.be.a('number');
        });
    });
});
