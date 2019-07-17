/* eslint-disable no-undef */

const email = 'storiesr@test.ia';

describe('stories:r permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.login();
        cy.get('@bf_project_id').then((id) => {
            cy.createUser('stories:r', email, ['stories:r', 'nlu-data:r'], id);
            cy.addStory(id);
            cy.addStoryGroup(id);
            cy.addSlot(id);
        });
        cy.logout();
    });

    beforeEach(function() {
        cy.loginTestUser(email);
    });

    after(function() {
        cy.login();
        cy.deleteUser(email);
        cy.removeStory();
        cy.removeStoryGroup();
        cy.removeSlot();
        cy.logout();
    });

    it('should be able to stories', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        // Check that it actually reaches the route
        cy.contains('Stories');
        cy.contains('Slots');
    });

    it('should NOT be able add stories, delete and update stories', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        cy.contains('TestName').click();
        cy.get('[data-cy=add-item]').should('not.exist');
        cy.get('[data-cy=add-story]').should('not.exist');
        cy.get('[data-cy=delete-story]').should('not.exist');
        cy.dataCy('story-title').should('be.disabled');
    });

    it('should NOT be able edit and add slots', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        cy.contains('Slots').click();
        cy.get('[data-cy=add-slot]').should('not.exist');
        cy.get('[data-cy=slot-name]').should('have.class', 'disabled');
        cy.get('[data-cy=save-button]').should('not.exist');
    });

    it('should NOT be able call Meteor methods for stories', function() {
        cy.MeteorCall('storyGroups.insert', [
            {
                name: 'Test Story',
                projectId: this.bf_project_id,
                stories: [],
            },
        ]).then((result) => {
            expect(result.error).to.equal('403');
        });

        cy.MeteorCall('storyGroups.update', [
            {
                name: 'Test Story',
                projectId: this.bf_project_id,
                stories: [],
            },
            this.bf_project_id,
        ]).then((result) => {
            expect(result.error).to.equal('403');
        });

        cy.MeteorCall('storyGroups.delete', [
            {
                name: 'Test Story',
                projectId: this.bf_project_id,
                stories: [],
            },
            this.bf_project_id,
        ]).then((result) => {
            expect(result.error).to.equal('403');
        });
    });

    it('should NOT be able call Meteor methods for slots', function() {
        cy.MeteorCall('storyGroups.insert', [
            {
                name: 'Test Story',
                projectId: this.bf_project_id,
                stories: [],
            },
        ]).then((result) => {
            expect(result.error).to.equal('403');
        });

        cy.MeteorCall('storyGroups.update', [
            {
                name: 'Test Story',
                projectId: this.bf_project_id,
                stories: [],
            },
            this.bf_project_id,
        ]).then((result) => {
            expect(result.error).to.equal('403');
        });

        cy.MeteorCall('storyGroups.delete', [
            {
                name: 'Test Story',
                projectId: this.bf_project_id,
                stories: [],
            },
            this.bf_project_id,
        ]).then((result) => {
            expect(result.error).to.equal('403');
        });
    });
});
