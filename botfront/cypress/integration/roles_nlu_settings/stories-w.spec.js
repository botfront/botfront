/* eslint-disable no-undef */

const email = 'storiesr@test.ia';

describe('stories:w permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('stories:r', email, ['stories:w', 'nlu-data:r'], id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.login();
        cy.deleteUser(email);
        cy.logout();
    });

    it('should be able add stories and then delete it', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        // Check that it actually reaches the route
        cy.dataCy('add-item').click();
        cy.dataCy('add-item-input').find('input').type('StoryDelete{enter}');
        cy.contains('StoryDelete').click();
        cy.get('[data-cy=add-story]').should('exist');
        cy.get('[data-cy=delete-story]').click({ force: true });
        cy.get('[data-cy=confirm-yes]').click({ force: true });
        cy.contains('StoryDelete').should('not.exist');
    });

    it('should be able add slots and then delete it', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        // Check that it actually reaches the route
        cy.contains('Slots').click();
        cy.get('[data-cy=add-slot]').click();
        cy.get('[data-cy=slot-name]').click();
        cy.get('[data-cy=slot-name] input').click().type('Test Slot{enter}');
        cy.get('[data-cy=type-field]').click();
        cy.get('[data-cy=type-field] input').click().type('bool{enter}');
        cy.get('[data-cy=save-button]').click();
        // Delete the slot
        cy.dataCy('save-button').trigger('mouseover');
        cy.dataCy('delete-slot').click();
        cy.dataCy('confirm-yes').click();
    });

    it('should be able call Meteor methods for stories', function() {
        cy.MeteorCall('storyGroups.insert', [
            {
                _id: 'TODELETE',
                name: 'Test Story',
                projectId: this.bf_project_id,
            },
        ]).then((result) => {
            expect(result).to.be.a('string');
        });

        cy.MeteorCall('stories.insert', [
            {
                _id: 'DELETESTORY',
                projectId: this.bf_project_id,
                storyGroupId: 'TODELETE',
                story: '',
                title: 'Test Story',
            },
        ]).then((result) => {
            expect(result).to.be.a('string');
        });

        cy.MeteorCall('storyGroups.update', [
            {
                _id: 'TODELETE',
                name: 'Test Story',
                projectId: this.bf_project_id,
            },
        ]).then((result) => {
            expect(result).to.equal(1);
        });

        cy.MeteorCall('stories.update', [
            {
                _id: 'DELETESTORY',
                projectId: this.bf_project_id,
                storyGroupId: 'TODELETE',
            },
        ]).then((result) => {
            expect(result).to.equal(1);
        });

        cy.MeteorCall('storyGroups.delete', [
            {
                _id: 'TODELETE',
                name: 'Test Story',
                projectId: this.bf_project_id,
            },
        ]).then((result) => {
            expect(result).to.equal(1);
        });

        cy.MeteorCall('stories.delete', [
            {
                _id: 'DELETESTORY',
                projectId: this.bf_project_id,
                storyGroupId: 'TODELETE',
            },
        ]).then((result) => {
            expect(result).to.equal(1);
        });
    });

    it('should be able call Meteor methods for slots', function() {
        // Test to add a slot
        cy.MeteorCall('slots.insert', [
            {
                _id: 'DELETESLOT',
                name: 'Test Slot',
                projectId: this.bf_project_id,
                type: 'bool',
            },
            this.bf_project_id,
        ]).then((result) => {
            expect(result).to.be.a('string');
        });

        cy.MeteorCall('slots.update', [
            {
                _id: 'DELETESLOT',
                name: 'Test Slot',
                projectId: this.bf_project_id,
                type: 'bool',
            },
            this.bf_project_id,
        ]).then((result) => {
            expect(result).to.equal(1);
        });

        cy.MeteorCall('slots.delete', [
            {
                _id: 'DELETESLOT',
                name: 'Test Slot',
                projectId: this.bf_project_id,
                type: 'bool',
            },
            this.bf_project_id,
        ]).then((result) => {
            expect(result).to.equal(1);
        });
    });
});
