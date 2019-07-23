/* eslint-disable no-undef */

describe('intial setup', function() {
    before(function() {
        if (!Cypress.env('MODE') || Cypress.env('MODE') !== 'CI_RUN') {
            cy.exec('mongo meteor --host localhost:3001 --eval "db.dropDatabase();"');
        }
    });

    after(function() {
        // cy.fixture('bf_project_id.txt').as('bf_project_id');
        // cy.get('@bf_project_id').then((id) => {
        cy.deleteProject('bf');
        // });
    });

    it('Should create projects when completing the initial setup', () => {
        cy.visit('/');
        cy.url().should('be', '/setup/welcome');

        cy.visit('/login');

        cy.url().should('be', '/setup/welcome');

        cy.get('[data-cy=start-setup]').click();

        cy.url().should('be', '/setup/account');

        cy.get('#uniforms-0000-0001').type('Testing');
        cy.get('#uniforms-0000-0003').type('McTest');
        cy.get('#uniforms-0000-0005').type('test@test.com');
        cy.get('#uniforms-0000-0007').type('aaaaaaaa00');
        cy.get('#uniforms-0000-0009').type('aaaaaaa{enter}');

        cy.contains('The passwords are not matching');
        cy.contains('Your password should contain at least');

        cy.get('#uniforms-0000-0007').type('{selectall}{del}Aaaaaaaa00');
        cy.get('#uniforms-0000-0009').type('{selectall}{del}Aaaaaaaa00{enter}');

        cy.get('[data-cy=account-step]').click();
        cy.contains('Continue').click();

        cy.get('input:first').type('Duedix');
        cy.get('[data-cy=project-create-button]').click();

        cy.contains('Select the default language').click();
        cy.get('[role=listbox]')
            .contains('English')
            .click();

        cy.get('[data-cy=project-create-button]').click();

        cy.get('[data-cy=project-step]').click();

        cy.get('[data-cy=consent-step]').click();
        // Nothing should happen

        cy.get('[data-cy=project-create-button]').click();

        cy.get('[data-cy=email-consent]').click();

        cy.wait(5000);

        // cy.url().then((url) => {
        //     // This gets the project id
        //     const id = url.match(/project\/(.*?)\/nlu/i)[1];
        //     cy.writeFile('cypress/fixtures/bf_project_id.txt', id);
        // });

        // cy.url().then((url) => {
        //     // This gets the model id
        //     const id = url.split('/')[7];
        //     cy.writeFile('cypress/fixtures/bf_model_id.txt', id);
        // });
        // cy.get('[data-cy=example-text-editor-input]').should('exist'); // Test if a default instance is added
        // cy.get('[data-cy=settings-in-model]').click();
        // cy.contains('Pipeline').click();
        // cy.get(':checkbox').should('be.checked');
    });
});
