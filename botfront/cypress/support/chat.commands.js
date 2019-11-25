/* global cy Cypress:true */
import { expect } from 'chai';

Cypress.Commands.add('newChatSesh', (lang) => {
    cy.dataCy('open-chat').should('not.be.visible');
    cy.dataCy('restart-chat').click();
    cy.get('[data-cy=chat-language-option]').click();
    cy.get('[data-cy=chat-language-option] .visible.menu')
        .contains(lang)
        .click();
});

Cypress.Commands.add('compareLastMessage', (expectedResponse) => {
    const response = typeof expectedResponse === 'string'
        ? expectedResponse
        : expectedResponse.response;
    const { replies } = expectedResponse;
    cy.wait(500);
    cy.get('.typing-indication').should('not.exist');
    if (response) cy.get('.message').last().get('.response').contains(response);
    if (replies) {
        cy.get('.message').last().get('.replies').find('.reply')
            .then($replies => expect(Array.from($replies).map(r => r.innerText)).to.deep.equal(replies));
    }
});

Cypress.Commands.add('testChatInput', (utterance, expectedResponse) => {
    cy.get('input.new-message').should('not.have.class', 'disabled');
    cy.get('input.new-message').click().type(`${utterance}{enter}`, { force: true });
    // Verify response
    cy.compareLastMessage(expectedResponse);
});

Cypress.Commands.add('testChatQR', (buttonText, expectedResponse) => {
    cy.get('input.new-message').should('not.have.class', 'disabled');
    cy.get('.message').last().get('.replies')
        .find('.reply')
        .contains(buttonText)
        .click();
    // Verify response
    cy.compareLastMessage(expectedResponse);
});
