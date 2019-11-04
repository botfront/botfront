/* eslint-disable no-undef */

describe('incoming page', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en');
        cy.login();
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('should have be able to view different conversations', function() {
        cy.visit('/project/bf/incoming');
        
    });
    it('should have be able to change pages', function() {
    });
    it('should go to the same page and conversation when refreshed', function() {
    });
});
