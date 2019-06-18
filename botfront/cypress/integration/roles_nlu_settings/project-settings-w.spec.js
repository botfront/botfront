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
        cy.fixture('project_data.json').as('project_data');
    });

    after(function() {
        cy.deleteUser(email);
        cy.exec('mongo meteor --host localhost:3001 --eval "db.nlu_instances.remove({ name: \'Test Name\'});"');
        // Deletes the german model, created during the test.
        cy.deleteNLUModelProgramatically(null, this.bf_project_id, 'de');
    });

    it('should be able to change project info and should not be able to see More Settings', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Project Info').click();
        cy.get('.project-name').should('not.have.class', 'disabled');
        cy.get('[data-cy=language-selector]').click();
        cy.get('[data-cy=language-selector] input').type('German{enter}');
        cy.get('.project-settings-menu-info').click();
        cy.get('.project-default-language').should('not.have.class', 'disabled');
        cy.get('[data-cy=save-changes]').click();
        cy.contains('More Settings').should('not.exist');
        //  A new German model has been saved. Now we will check that the language is actually present in default languages.
        cy.get('.project-default-language').click();
        cy.get('.project-default-language input').type('Ger');
        cy.get('.project-default-language').contains('German').should('exist');

        // For meteor call
        cy.MeteorCall('project.update', [
            {
                name: 'Duedix',
                _id: this.bf_project_id,
                defaultLanguage: 'en',
            },
        ]).then((result) => {
            expect(result).to.be.equals(1);
        });
    });

    it('should be able to change credentials', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Credentials').click();
        cy.get('[data-cy=ace-field]').should('not.have.class', 'disabled');
        cy.get('[data-cy=save-button]').should('not.to.be.disabled');
        cy.get('@project_data').then((data) => {
            cy.MeteorCall('credentials.save', [
                {
                    projectId: this.bf_project_id,
                    credentials: data.defaultCredentials,
                },
            ]).then((result) => {
                expect(result.numberAffected).to.be.a('number');
            });
        });
    });

    it('should be able to change Endpoints', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Endpoints').click();
        cy.get('[data-cy=ace-field]').should('not.have.class', 'disabled');
        cy.get('[data-cy=save-button]').should('not.to.be.disabled');
        cy.get('@project_data').then((data) => {
            cy.MeteorCall('endpoints.save', [
                {
                    projectId: this.bf_project_id,
                    endpoints: data.defaultEndpoints,
                },
            ]).then((result) => {
                expect(result.numberAffected).to.be.a('number');
            });
        });
    });

    it('should be able to update instances', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Instance').click();
        cy.get('[data-cy=save-instance]').click();

        // Dummy instance is created for test
        cy.MeteorCall('instance.insert', [
            {
                _id: 'TODELETE',
                projectId: this.bf_project_id,
                host: 'http://host.docker.internal:5000',
                name: 'Test Name',
            },
        ]).then(() => {
            cy.MeteorCall('instance.update', [
                {
                    _id: 'TODELETE',
                    projectId: this.bf_project_id,
                    host: 'http://rasa:5005',
                    name: 'Test Name',
                },
            ]).then((result) => {
                expect(result).to.be.equals(1);
            });
        });
    });
});
