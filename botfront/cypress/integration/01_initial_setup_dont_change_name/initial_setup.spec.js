/* global cy Cypress:true */

describe('intial setup', function () {
    before(function() {
        if (!Cypress.env('MODE') || Cypress.env('MODE') !== 'CI_RUN') {
            cy.exec('mongo bf-os --host localhost:27017 --eval "db.dropDatabase();"');
            // wipping the db also wipe the indexes we need to recreate thoses
            cy.exec('mongo bf-os --host localhost:27017 --eval "db.botResponses.createIndex({key:1, projectId:1}, {unique: true});"');
            cy.wait(1000);
        }
        cy.waitForResolve(Cypress.env('baseUrl'));
    });


    after(function () {
        cy.deleteProject('bf');
    });

    it('Should create projects when completing the initial setup', () => {
        cy.visit('/');
        cy.url().should('include', '/setup/welcome');
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
        cy.contains('Continue').click();

        cy.contains('Select the default language').click();
        cy.get('[role=listbox]')
            .contains('English')
            .click();

        cy.get('[data-cy=project-create-button]').click();

        cy.get('[data-cy=project-step]').click();

        cy.get('[data-cy=consent-step]').click();
        // Nothing should happen

        cy.get('[data-cy=project-create-button]').click();

        cy.get('[data-cy=email-refuse]').click();

        cy.wait(5000);
        cy.url({ timeout: 30000 }).should('include', '/dialogue');

        // cy.url().then((url) => {
        // This gets the project id
        //     const id = url.match(/project\/(.*?)\/nlu/i)[1];
        //     cy.writeFile('cypress/fixtures/bf_project_id.txt', id);
        // });

        // cy.url().then((url) => {
        //     // This gets the model id
        //     const id = url.split('/')[7];
        //     cy.writeFile('cypress/fixtures/bf_model_id.txt', id);
        // });
        // cy.get('[data-cy=example-text-editor-input]').should('exist'); // Test if a default instance is added
        // cy.get('[data-cy=nlu-menu-settings]').click();
        // cy.contains('Pipeline').click();
        // cy.get(':checkbox').should('be.checked');
    });
});
