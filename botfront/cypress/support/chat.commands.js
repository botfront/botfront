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
    if (response) {
        // this first contains makes it wait until the response actually appears
        cy.contains(response);
        cy.get('.rw-message').last().get('.rw-response').contains(response);
    }
    if (replies) {
        cy.get('.rw-message').last().get('.rw-replies').find('.rw-reply')
            .then($replies => expect(Array.from($replies).map(r => r.innerText)).to.deep.equal(replies));
    }
});

Cypress.Commands.add('testChatInput', (utterance, expectedResponse) => {
    cy.get('input.rw-new-message').should('not.have.class', 'rw-disabled');
    cy.get('input.rw-new-message').click().type(`${utterance}{enter}`, { force: true });
    // Verify response
    cy.compareLastMessage(expectedResponse);
});

Cypress.Commands.add('testChatQR', (buttonText, expectedResponse) => {
    cy.get('input.rw-new-message').should('not.have.class', 'rw-disabled');
    cy.get('.rw-message').last().get('.rw-replies')
        .find('.rw-reply')
        .contains(buttonText)
        .click();
    // Verify response
    cy.compareLastMessage(expectedResponse);
});
