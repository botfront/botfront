/* global cy Cypress:true */

Cypress.Commands.add('addNewProjectLanguage', (language) => {
    cy.visit('/project/bf/settings');
    cy.dataCy('language-selector')
        .click({ force: true })
        .find('.item')
        .contains(language)
        .click({ force: true });
    cy.dataCy('save-changes')
        .click({ force: true });
    cy.get('.s-alert-success').should('be.visible');
});
