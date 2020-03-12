/* global cy Cypress:true */
import { expect } from 'chai';

const findGroupAndOpenIfClosed = (groupName, saveToAlias = 'alias') => {
    cy.dataCy('story-group-menu-item', groupName).should('exist')
        .findCy('toggle-expansion-story-group').as(saveToAlias)
        .then((item) => {
            if (item.hasClass('right')) item.click({ force: true }).then(clicked => expect(clicked).to.have.class('down'));
        });
};

const findStoryAndSelect = (storyName, saveToAlias = 'alias') => {
    cy.dataCy('story-group-menu-item', storyName).should('exist')
        .first().as(saveToAlias)
        .click();
};

const renameStoryOrGroup = (alias, newName) => {
    cy.get(`@${alias}`).find('.item-name').dblclick({ force: true });
    cy.get(`@${alias}`).find('input').type(`{selectAll}${newName}{enter}`);
};

Cypress.Commands.add('browseToStory', (storyName = 'Groupo (1)', groupName) => {
    if (groupName) findGroupAndOpenIfClosed(groupName);
    findStoryAndSelect(storyName);
});

Cypress.Commands.add('linkStory', (storyName, linkTo) => {
    cy.dataCy('story-title').should('exist').then((title) => {
        if (title.attr('value') !== storyName) cy.browseToStory(storyName); // or .text()
    });
    cy.dataCy('stories-linker')
        .first().click();
    cy.dataCy('stories-linker')
        .find('div.item').contains(linkTo)
        .click();
    cy.dataCy('story-footer').should('have.class', 'linked');
});

Cypress.Commands.add('createStoryGroup', ({ groupName = 'Groupo' } = {}) => {
    cy.visit('/project/bf/stories');
    cy.dataCy('add-item').click({ force: true });
    cy.dataCy('add-item-input')
        .find('input')
        .type(`${groupName}{enter}`);
});

Cypress.Commands.add('createStoryInGroup', ({ groupName = 'Groupo', storyName = null } = {}) => {
    findGroupAndOpenIfClosed(groupName);
    cy.dataCy('story-group-menu-item', groupName).then((n) => {
        if (n.next().attr('type') === 'story-group') cy.wrap([]).as('stories');
        else cy.wrap(n.nextUntil('[type="story-group"]')).as('stories');
    });
    cy.dataCy('story-group-menu-item', groupName)
        .findCy('add-story-in-story-group')
        .click({ force: true });
    cy.get('@stories').then((stories) => {
        findStoryAndSelect(`${groupName} (${stories.length + 1})`, 'new-story');
    });
    if (storyName) renameStoryOrGroup('new-story', storyName);
});

Cypress.Commands.add('deleteStoryOrGroup', (name = 'Groupo', confirm = true) => {
    cy.dataCy('story-group-menu-item', name).should('exist')
        .findCy('delete-story-group').click({ force: true });
    if (confirm) cy.get('.modal').find('.primary.button').click({ force: true });
});

Cypress.Commands.add('renameStoryOrGroup', (name = 'Groupo', newName = 'Groupa') => {
    cy.dataCy('story-group-menu-item', name).should('exist').as('found-item');
    renameStoryOrGroup('found-item', newName);
});
