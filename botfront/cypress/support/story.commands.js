/* global cy Cypress */

const findGroupAndOpenIfClosed = (groupName, saveToAlias = 'alias') => {
    cy.dataCy('story-group-menu-item', groupName).should('exist')
        .findCy('toggle-expansion-story-group').as(saveToAlias)
        .then((item) => {
            if (item.hasClass('right')) cy.wrap(item).click({ force: true });
        })
        .should('have.class', 'down');
};

const findStoryAndSelect = (storyName, saveToAlias = 'alias') => {
    cy.dataCy('story-group-menu-item', storyName, '[type="story"]')
        .first().as(saveToAlias)
        .click();
};

const renameStoryOrGroup = (alias, newName) => {
    cy.get(`@${alias}`).find('.item-name').dblclick({ force: true });
    cy.get(`@${alias}`).find('input').type(`{selectAll}{backSpace}{selectAll}{backSpace}${newName}{enter}`);
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
        .find(`div.item:contains(${linkTo})`)
        .click({ force: true });
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

Cypress.Commands.add('deleteStoryOrGroup', (name = 'Groupo', type = null, confirm = true) => {
    const filter = type ? `[type="${type}"]` : null;
    cy.dataCy('story-group-menu-item', name, filter).should('exist')
        .findCy('delete-story-group').click({ force: true });
    if (confirm) cy.get('.modal').find('.primary.button').click({ force: true });
});

Cypress.Commands.add('renameStoryOrGroup', (name = 'Groupo', newName = 'Groupa', type = null) => {
    const filter = type ? `[type="${type}"]` : null;
    cy.dataCy('story-group-menu-item', name, filter).should('exist').as('found-item');
    renameStoryOrGroup('found-item', newName);
});

Cypress.Commands.add('toggleStoryGroupCollapsed', ({ groupName = 'Groupo' }) => {
    const filter = '[type="story-group"]';
    cy.dataCy('story-group-menu-item', groupName, filter).find('[data-cy=toggle-expansion-story-group]').click({ force: true });
});

Cypress.Commands.add('toggleStoryGroupFocused', (groupName = 'Groupo') => {
    cy.dataCy('story-group-menu-item', groupName, '[type="story-group"]').findCy('focus-story-group').click({ force: true });
});

Cypress.Commands.add('selectStories', (firstName = 'Groupo (1)', n = 1, direction = 'down') => {
    findStoryAndSelect(firstName, 'first');
    const key = direction === 'down' ? 'ArrowDown' : direction === 'up' ? 'ArrowUp' : null;
    let i = 0;
    while (i < n - 1) {
        cy.get('@first').trigger('keydown', { force: true, key, shiftKey: true });
        i += 1;
    }
});

Cypress.Commands.add('moveStoryOrGroup', ({ name: originName, type: originType = null }, { name: destinationName, type: destinationType = null, index = null } = {}) => {
    cy.dataCy('story-group-menu-item', originName, originType ? `[type="${originType}"]` : null).then((origin) => {
        cy.getWindowMethod('getParentAndIndex').then((getParentAndIndex) => {
            cy.wrap(getParentAndIndex(origin[0].id.replace('story-menu-item-', ''))).as('origin');
        });
    });
    if (!destinationName) cy.wrap([{ id: 'story-menu-item-root' }]).as('destination');
    else cy.dataCy('story-group-menu-item', destinationName, destinationType ? `[type="${destinationType}"]` : null).as('destination');

    cy.getWindowMethod('moveItem').then((moveItem) => {
        cy.get('@destination').then(destination => cy.get('@origin').then((origin) => {
            moveItem(origin, { parentId: destination[0].id.replace('story-menu-item-', ''), ...(Number.isInteger(index) ? { index } : {}) });
        }));
    });
    cy.wait(300);
});

Cypress.Commands.add('addUserUtterance', (text, intent, index = 0, options = {}) => {
    const { checkForIntent = false } = options;
    cy.dataCy('utterance-input')
        .find('input')
        .type(`${text}{enter}`);
    cy.dataCy('intent-label').should('have.length', index + 1);
    if (checkForIntent) cy.dataCy('intent-label').eq(index).should('have.text', intent);
    cy.dataCy('intent-label').eq(index).click();
    cy.get('.intent-dropdown input')
        .click({ force: true })
        .type(`${intent}{enter}`);
    cy.dataCy('save-new-user-input').click({ force: true });
});
