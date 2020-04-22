/* global cy Cypress expect */

Cypress.Commands.add('createResponseFromResponseMenu', (type = 'text', name = null) => {
    cy.visit('/project/bf/dialogue/templates');
    cy.dataCy('create-response').click();
    cy.dataCy(`add-${type}-response`).click();
    if (name) {
        cy.dataCy('response-name-input').find('input').focus().type(name)
            .blur();
    }
});

Cypress.Commands.add('setImage', (url, n = 0) => {
    cy.dataCy('image-container').then(els => expect(els).to.have.length.of.at.least(n + 1));
    cy.dataCy('image-container').eq(n)
        .findCy('set-image')
        .click();
    cy.dataCy('image-url-input').find('input').type(`${url}{enter}`);
    cy.dataCy('image-container').eq(n)
        .find('img').should('have.attr', 'src')
        .and('equal', url);
});
