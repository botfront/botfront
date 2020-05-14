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
    cy.wait(100);
    cy.dataCy('image-container').eq(n)
        .findCy('set-image')
        .click();
    cy.dataCy('image-url-input').find('input').type(`${url}{enter}`);
    cy.dataCy('image-container').eq(n)
        .find('img').should('have.attr', 'src')
        .and('equal', url);
});

Cypress.Commands.add('setTitleAndSubtitle', (title, subtitle, n = 0) => {
    cy.get('.carousel-slide').then(els => expect(els).to.have.length.of.at.least(n + 1));
    cy.get('.carousel-slide').eq(n)
        .find('.ui.header').find('textarea')
        .as('titles');
    [title, subtitle].forEach((t, i) => {
        if (t) {
            cy.get('@titles').eq(i).focus().type(t)
                .blur();
        }
    });
});

Cypress.Commands.add('addButtonOrSetPayload', (title, payload, oldTitleOrPosition = 0) => {
    if (title === 'default_action') {
        cy.dataCy('image-container').then(els => expect(els).to.have.length.of.at.least(oldTitleOrPosition + 1));
        cy.dataCy('image-container').eq(oldTitleOrPosition)
            .findCy('set-default-action')
            .click();
    } else if (Number.isInteger(oldTitleOrPosition)) cy.dataCy('add-quick-reply').eq(oldTitleOrPosition).click();
    if (title || payload) {
        if (title !== 'default_action') cy.dataCy(Number.isInteger(oldTitleOrPosition) ? 'button_title' : oldTitleOrPosition).click();
        if (title && title !== 'default_action') {
            cy.dataCy('enter-button-title')
                .find('input')
                .clear()
                .type(title);
        }
        if (payload) {
            const option = payload.url ? 1 : 0;
            cy.dataCy('select-button-type')
                .click()
                .find('[role=option]').eq(option)
                .click();
            if (option === 0) {
                cy.dataCy('intent-label').contains('intent')
                    .click({ force: true });
                cy.get('.intent-dropdown input')
                    .type(`${payload.payload.intent}{enter}`);
            } else {
                cy.dataCy('enter_url')
                    .find('input')
                    .focus()
                    .clear()
                    .type(`${payload.url}`)
                    .blur();
            }
        }
        cy.dataCy('save-button').click({ force: true });
    }
});

Cypress.Commands.add('setQuickReplyContent', (text, title, intent, index = 0) => {
    cy.dataCy('response-editor').find('[data-cy=bot-response-input]').eq(index).click();
    cy.dataCy('response-editor').find('[data-cy=bot-response-input]')
        .find('textarea')
        .eq(index)
        .type(text)
        .blur();
    cy.dataCy('response-editor').find('[data-cy=button_title]').eq(index).click({ force: true });
    cy.dataCy('response-editor').find('[data-cy=button_title]').eq(index).click({ force: true });
    cy.dataCy('response-editor').find('[data-cy=button_title]').eq(index).click({ force: true });
    cy.dataCy('response-editor').find('[data-cy=button_title]').eq(index).click({ force: true });
    cy.dataCy('enter-button-title').find('input').type(title);
    cy.dataCy('intent-label').should('exist').click();
    cy.dataCy('intent-dropdown').find('input').type(`${intent}{enter}`);
    cy.dataCy('save-button').click();
});
