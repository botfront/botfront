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
        cy.exec('mongo meteor --host localhost:3001 --eval "db.rules.remove({ rules: \'RULE\'});"');
        cy.exec('mongo meteor --host localhost:3001 --eval "db.credentials.remove({ credentials: \'Credential\'});"');
        cy.exec('mongo meteor --host localhost:3001 --eval "db.endpoints.remove({ endpoints: \'Endpoint\'});"');
        cy.exec('mongo meteor --host localhost:3001 --eval "db.nlu_instances.remove({ name: \'Test Name\'});"');
    });

    it('should be able to change project info and should not be able to More Settings', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Project Info').click();
        cy.get('.project-name').should('not.have.class', 'disabled');
        cy.get('.project-default-languge').should('not.have.class', 'disabled');
        cy.contains('More Settings').should('not.exist');

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

    it('should be able to change credentials', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Credentials').click();
        cy.get('[data-cy=ace-field]').should('not.have.class', 'disabled');
        cy.get('[data-cy=save-button]').should('not.to.be.disabled');

        // For meteor call
        cy.MeteorCall('credentials.save', [
            {
                projectId: this.bf_project_id,
                credentials: 'Credential',
            },
        ]).then((result) => {
            expect(result.numberAffected).to.be.a('number');
        });
    });

    it('should be able to change Endpoints', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Endpoints').click();
        cy.get('[data-cy=ace-field]').should('not.have.class', 'disabled');
        cy.get('[data-cy=save-button]').should('not.to.be.disabled');

        // For meteor call
        cy.MeteorCall('endpoints.save', [
            {
                projectId: this.bf_project_id,
                endpoints: 'Endpoint',
            },
        ]).then((result) => {
            expect(result.numberAffected).to.be.a('number');
        });
    });

    // For meteor call
    it('should be able to create new instances', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Instances').click();
        cy.contains('New instance').click();
        cy.get('[name=name]').type('Test Name');
        cy.get('[data-cy=type-selector] input').type('nlu{enter}');
        cy.get('[name=host]').type('http://localhost:5005');
        cy.get('[data-cy=save-instance]').click();

        cy.MeteorCall('instance.insert', [
            {
                _id: 'TODELETE',
                projectId: this.bf_project_id,
                host: 'http://host.docker.internal:5000',
                type: ['core'],
                name: 'Test Name',
            },
        ]).then((result) => {
            console.log(result);
            expect(result).to.be.equals('TODELETE');
        });
    });

    it('should be able to create update instances', function() {
        cy.visit(`/project/${this.bf_project_id}/settings`);
        cy.contains('Instances').click();
        cy.get(':nth-child(1) > .extra > .basic > [data-cy=edit-instance] > .edit').click();
        cy.get('[data-cy=save-instance]').click();

        cy.MeteorCall('instance.update', [
            {
                _id: 'TODELETE',
                projectId: this.bf_project_id,
                host: 'http://host.docker.internal:5000',
                type: ['nlu'],
                name: 'Test Name',
            },
        ]).then((result) => {
            expect(result).to.be.equals(1);
        });
    });
});
