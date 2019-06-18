/* eslint-disable no-undef */

const email = 'projectsettingsr@test.ia';

describe('project-settings:r role permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').as('bf_model_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('project-settings:r', email, ['project-settings:r'], id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.deleteUser(email);
    });

    it('should display the right items in the sidebar', function() {
        cy.visit('/');
        cy.get('[data-cy=project-menu]').then((sidebar) => {
            cy.wrap(sidebar).contains('Responses').should('not.exist');
            cy.wrap(sidebar).contains('NLU').should('not.exist');
            cy.wrap(sidebar).contains('Conversations').should('not.exist');
            cy.wrap(sidebar).contains('Settings');
        });
    });

    it('should NOT be able to change project info', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Project Info').click();
        cy.get('.project-name').should('have.class', 'disabled');
        cy.get('.project-default-language').should('have.class', 'disabled');
        cy.contains('More Settings').should('not.exist');
        cy.get('[data-cy=save-changes]').should('be.disabled');
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

    it('should NOT be able to change credentials', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Credentials').click();
        cy.get('[data-cy=save-button]').should('be.disabled');
        cy.get('[data-cy=ace-field]').should('have.class', 'disabled');
        cy.get('[data-cy=save-button]').should('be.disabled');

        // For meteor call
        cy.MeteorCall('credentials.save', [
            {
                projectId: this.bf_project_id,
                credentials: 'Credential',
            },
        ]).then((result) => {
            expect(result.error).to.be.equals('403');
        });
    });

    it('should NOT be able to change Endpoints', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Endpoints').click();
        cy.get('[data-cy=ace-field]').should('have.class', 'disabled');
        cy.get('[data-cy=save-button]').should('be.disabled');

        // For meteor call
        cy.MeteorCall('endpoints.save', [
            {
                projectId: this.bf_project_id,
                endpoints: 'Endpoint',
            },
        ]).then((result) => {
            expect(result.error).to.be.equals('403');
        });
    });

    it('should NOT be able edit instance values', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Instance').click();
        cy.get('[data-cy=save-instance]').should('be.disabled');
        // For meteor call
        cy.MeteorCall('instance.insert', [
            {
                _id: 'TODELETE',
                projectId: this.bf_project_id,
                host: 'http://host.docker.internal:5000',
                type: ['core'],
                name: 'Test Name',
            },
        ]).then((result) => {
            expect(result.error).to.be.equals('403');
        });
    });
});
