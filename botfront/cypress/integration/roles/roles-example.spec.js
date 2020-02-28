/* eslint-disable no-undef */
// example file to demonstrate cypress commands for roles
const email = 'test@test.test';

describe('example', function() {
    beforeEach(function() {
        cy.login();
        cy.createProject('bf', 'My Project', 'fr');
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('should be able to create an role with a permission', function() {
        // we create a dummy role to test one persmission
        cy.createRole('dummy', 'dummy', ['triggers:r']);
        // we create a user using this role to test one persmission
        cy.createUser('test', email, ['dummy'], 'bf');
        
        cy.login(true, email);
        cy.wait(2000);
        cy.deleteUser('test@test.test');
        // we need to provide a fallback role otherwise the role change will not work
        
        cy.deleteRole('dummy', 'global-admin');
        // cy.wait(2000);
    });

    // Same as before but with helper to make it concise
    it('should be able to create an role with a permission short', function() {
        // we create a dummy role to test one persmission
        cy.createDummyRoleAndUserThenLogin(email, ['triggers:r']);
        cy.wait(2000);
        cy.removeDummyRoleAndUser(email, 'global-admin');
        cy.wait(2000);
    });
});
