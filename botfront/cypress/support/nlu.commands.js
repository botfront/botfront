/* global cy Cypress */

Cypress.Commands.add('addExamples', (examples = [], intent = null) => {
    cy.dataCy('example-text-editor-input').type(`${examples.join('\n')}{enter}`);
    examples.forEach(text => cy.dataCy('utterance-text', text).should('exist'));
    if (intent) {
        cy.get('.row').eq(0).click().should('have.class', 'selected');
        cy.get('body').type('{shift}', { release: false });
        cy.get('.row').eq(examples.length - 1).click();
        cy.get('.row.selected').should('have.length', examples.length);
        cy.get('body').type('{shift}');
        cy.changeIntentOfSelectedUtterances(intent);
        cy.get('.virtual-table').focus();
        cy.get('body').type('s');
        cy.get('@texts').then((texts) => { if (texts.length > 1) cy.yesToConfirmation(); });
    }
});
