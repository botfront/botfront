/* global cy Cypress:true */

describe('intial setup', function () {
    before(function() {
        if (!Cypress.env('MODE') || Cypress.env('MODE') !== 'CI_RUN') {
            cy.exec('mongo bf --host localhost:27017 --eval "db.dropDatabase();"');
            // wipping the db also wipe the indexes we need to recreate thoses
            cy.exec('mongo bf --host localhost:27017 --eval "db.botResponses.createIndex({key:1, projectId:1}, {unique: true});"');
            cy.wait(1000);
        }
        cy.waitForResolve(Cypress.env('baseUrl'));
    });


    after(function () {
        cy.deleteProject('bf');
    });

    it('Should create projects when completing the initial setup', () => {
        cy.visit('/');
        
        cy.url().should('be', '/setup/welcome');
        cy.get('[data-cy=start-setup]').click();

        cy.get('#uniforms-0001-0001').type('Testing');
        cy.get('#uniforms-0001-0003').type('McTest');
        cy.get('#uniforms-0001-0005').type('test@test.com');
        cy.get('#uniforms-0001-0007').type('aaaaaaaa00');
        cy.get('#uniforms-0001-0009').type('aaaaaaa{enter}');

        cy.contains('The passwords are not matching');
        cy.contains('Your password should contain at least');

        cy.get('#uniforms-0001-0007').type('{selectall}{del}Aaaaaaaa00');
        cy.get('#uniforms-0001-0009').type('{selectall}{del}Aaaaaaaa00{enter}');

        cy.get('[data-cy=account-step]').click();
        cy.contains('Create').click();


        cy.wait(5000);
        cy.url({ timeout: 30000 }).should('include', '/admin/projects');
    });
});
