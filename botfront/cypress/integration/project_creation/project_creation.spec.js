/* eslint-disable no-undef */
describe('Project Creation', function() {
    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('When creating a new project, a default model should be added to the project', function() {
        cy.visit('/admin/projects');
        // Creating a project
        cy.wait(1000);
        cy.get('[data-cy=\'new-project\']').click();
        cy.dataCy('project-name').find('input').type('Test Project');
        cy.dataCy('project-namespace').find('input').type('bf-testproject');
        cy.contains('Select the default language of your project').click();
        cy.get('[role=listbox]').contains('English').click();
        cy.dataCy('disable').click();
        cy.dataCy('submit-field').click();
        // Checking if the project is created correctly
        cy.contains('Test Project').click();
        cy.get('[data-cy=language-selector] input').type('English{enter}');
        cy.contains('English');
        // Deleting the Test project, First Disable the project, then delete it
        cy.visit('/admin/projects');
        cy.get('input').eq(0).click().type('Test');
        cy.get('.center .grey').click();
        cy.get('.ui > label').click();
        cy.dataCy('submit-field').click();
        cy.visit('/admin/projects');
        cy.get('input').eq(0).click().type('Test');
        cy.get('.center .grey').click();
        cy.dataCy('delete-project').click();
        cy.contains('OK').click();
    });
});
