/* global cy Cypress:true */
import { expect } from 'chai';

Cypress.Commands.add('createStoryGroup', ({ groupName = 'Groupo' } = {}) => {
    cy.visit('/project/bf/stories');
    cy.dataCy('add-item').click({ force: true });
    cy.dataCy('add-item-input')
        .find('input')
        .type(`${groupName}{enter}`);
});

Cypress.Commands.add('createStoryInGroup', ({ groupName = 'Groupo', storyName = null } = {}) => {
    cy.dataCy('story-group-menu-item', groupName).should('exist')
        .findCy('toggle-expansion-story-group').then((item) => {
            if (item.hasClass('right')) item.click({ force: true }).then(clicked => expect(clicked).to.have.class('down'));
        });
    cy.dataCy('story-group-menu-item', groupName).then((n) => {
        if (n.next().attr('type') === 'story-group') cy.wrap([]).as('stories');
        else cy.wrap(n.nextUntil('[type="story-group"]')).as('stories');
    });
    cy.dataCy('story-group-menu-item', groupName)
        .findCy('add-story-in-story-group')
        .click({ force: true });
    cy.get('@stories').then((stories) => {
        cy.dataCy('story-group-menu-item', `${groupName} (${stories.length + 1})`).should('exist')
            .first().as('new-story')
            .click();
    });
    if (storyName) {
        cy.get('@new-story').find('.item-name').dblclick({ force: true });
        cy.get('@new-story').find('input').type(`{selectAll}${storyName}{enter}`);
    }
});

Cypress.Commands.add('deleteStoryOrGroup', ({ name = 'Groupo', confirm = true } = {}) => {
    cy.dataCy('story-group-menu-item', name).should('exist')
        .findCy('delete-story-group').click({ force: true });
    if (confirm) cy.get('.modal').find('.primary.button').click({ force: true });
});
