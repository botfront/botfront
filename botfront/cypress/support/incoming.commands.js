/* global cy Cypress:true */

Cypress.Commands.add('addNewUtterances', (utterances = [], language = 'English') => {
    // add utterances with populate
    cy.visit('/project/bf/incoming');
    cy.dataCy('populate')
        .click({ force: true });
    cy.dataCy('language-selector')
        .click()
        .find('span')
        .contains(language)
        .should('exist')
        .click();
    cy.get('textarea')
        .click()
        .type(utterances.join('{enter}'));
    cy.get('button')
        .contains('Add Utterances')
        .click();
    // define intents of new utterances
    cy.get('button').should('not.have.class', 'loading');
    cy.dataCy('newutterances')
        .click();
});

Cypress.Commands.add('selectOrUnselectIncomingRow', (text) => {
    cy.get(`.row:contains(${text})`).trigger('mousedown', { metaKey: true, force: true });
    cy.get(`.row:contains(${text})`).trigger('mouseup', { force: true });
});

Cypress.Commands.add('changeIntentOfSelectedUtterances', (intentName = 'dummy') => {
    cy.get('.row.selected').findCy('utterance-text').then(utterances => Array.from(utterances).map(u => u.outerText)).as('texts');
    cy.get('.virtual-table').focus();
    cy.get('body').type('i');
    cy.get('.intent-popup').find('input').type(`${intentName}{enter}`);
    cy.get('@texts').then((texts) => { if (texts.length > 1) cy.yesToConfirmation(); });
    cy.get('@texts').then(texts => texts.forEach((text) => {
        cy.get(`.row:contains(${text})`).findCy('intent-label')
            .should('have.text', intentName);
    }));
});

Cypress.Commands.add('toggleValidationOfSelectedUtterances', () => {
    cy.get('.row.selected').should('exist');
    cy.get('.row.selected').first().find('.check.icon').parent()
        .then((els) => {
            const originallyValidated = els[0].dataset.cy === 'invalidate-utterance';
            cy.get('.row.selected').findCy('utterance-text').then(utterances => Array.from(utterances).map(u => u.outerText)).as('texts');
            cy.get('.virtual-table').focus();
            cy.get('body').type('v');
            cy.get('@texts').then((texts) => { if (texts.length > 1) cy.yesToConfirmation(); });
            cy.get('@texts').then(texts => texts.forEach((text) => {
                cy.get(`.row:contains(${text})`).findCy(originallyValidated ? 'validate-utterance' : 'invalidate-utterance');
            }));
        });
});

Cypress.Commands.add('deleteSelectedUtterances', () => {
    cy.get('.row.selected').findCy('utterance-text').then(utterances => Array.from(utterances).map(u => u.outerText)).as('texts');
    cy.get('.virtual-table').focus();
    cy.get('body').type('d');
    cy.get('@texts').then((texts) => { if (texts.length > 1) cy.yesToConfirmation(); });
    cy.get('@texts').then(texts => texts.forEach((text) => {
        cy.get(`.row:contains(${text})`).should('not.exist');
    }));
});
