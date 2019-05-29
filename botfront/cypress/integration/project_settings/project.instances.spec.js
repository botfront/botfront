/* eslint-disable no-undef */

describe('Project Instances', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });

    beforeEach(function() {
        cy.login();
    });

    after(function() {
        cy.logout();
        cy.exec('mongo meteor --host localhost:3001 --eval "db.nlu_instances.remove({ name: \'CREATE\'});"');
    });

    describe('Instances', function() {
        it('should be able to create instance', function() {
            // Through UI
            cy.visit(`/project/${this.bf_project_id}/settings`);
            cy.contains('Instances').click();
            cy.contains('New instance').click();
            cy.get('[name=name]').type('Test Name');
            cy.get('[data-cy=type-selector] input').type('nlu{enter}');
            cy.get('[name=host]').type('http://localhost:5005');
            cy.get('[data-cy=save-instance]').click();

            // Meteor call
            cy.MeteorCall('instance.insert', [
                {
                    _id: 'TODELETE',
                    projectId: this.bf_project_id,
                    host: 'http://host.docker.internal:5000',
                    type: ['core'],
                    name: 'CREATE',
                },
            ]).then((result) => {
                expect(result).to.be.equals('TODELETE');
            });
        });

        it('should be able to edit already created instances', function() {
            // Through UI
            cy.visit(`/project/${this.bf_project_id}/settings`);
            cy.contains('Instances').click();
            cy.get(':nth-child(3) > .extra > .basic > [data-cy=edit-instance] > .edit').click();
            cy.get('[data-cy=save-instance]').click();
    
            // Meteor call
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

        it('should be able to delete an instance', function() {
            // Through UI
            cy.visit(`/project/${this.bf_project_id}/settings`);
            cy.contains('Instances').click();
            cy.get(':nth-child(3) > .extra > .basic > .red').click();
            cy.get('.actions > .primary').click();
    
            // Meteor call
            cy.MeteorCall('instance.remove', [
                'TODELETE',
                this.bf_project_id,
            ]).then((result) => {
                expect(result).to.be.equals(1);
            });
        });
    });

    after(function() {
    });
});
