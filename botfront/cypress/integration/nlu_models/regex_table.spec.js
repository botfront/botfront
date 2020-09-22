/* global cy:true */

describe('regex features table', () => {
    beforeEach(() => {
        cy.createProject('bf', 'trial', 'en');
        cy.login();
    });
    afterEach(() => {
        // cy.logout();
        // cy.deleteProject('bf');
        Cypress.runner.stop();
    });

    it('should create, edit, and delete a regex in the table', () => {
        cy.visit('/project/bf/nlu/model/en');
        cy.dataCy('nlu-page').find('.item').contains('Regex').click();
        // add a regex to the table
        cy.dataCy('key-input').find('input').click();
        cy.dataCy('key-input').find('input').type('test_regex');
        cy.dataCy('add-value').click();
        cy.dataCy('add-value').find('input').type('^[0-9]');
        cy.dataCy('save-new-table-row').click();
        cy.dataCy('lookup-table-row-key').should('have.text', 'test_regex');
        cy.dataCy('lookup-table-row-value').should('have.text', '^[0-9]');

        // edit the regex
        cy.dataCy('lookup-table-row-key').click();
        cy.dataCy('key-input').should('have.length', 2);
        cy.dataCy('key-input').last().find('input')
            .type('_edited{enter}')
            .blur();
        cy.dataCy('lookup-table-row-value').click();
        cy.dataCy('add-value').should('have.length', 2);
        cy.dataCy('add-value').last().find('input')
            // eslint-disable-next-line no-template-curly-in-string
            .type('*{enter}')
            .blur();
        cy.dataCy('lookup-table-row-key').should('have.text', 'test_regex_edited');
        cy.dataCy('lookup-table-row-value').should('have.text', '^[0-9]*');
        // delete the regex
        cy.dataCy('icon-trash').click({ force: true });
        cy.dataCy('lookup-table-row-value').should('not.exist');
    });
});
