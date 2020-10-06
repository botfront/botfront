/* global cy Cypress expect */

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
    cy.get(`@${alias}`).find('input').clear()
        .type(`{selectAll}{backSpace}{selectAll}{backSpace}${newName}{enter}`);
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
    cy.dataCy('add-item').click({ force: true });
    cy.dataCy('add-item-input')
        .find('input')
        .type(`${groupName}{enter}`);
});

Cypress.Commands.add('createStoryInGroup', ({ groupName = 'Groupo', storyName = null } = {}) => {
    findGroupAndOpenIfClosed(groupName);
    cy.dataCy('story-group-menu-item').then((storyItems) => {
        // count of nodes in the tree
        const len = storyItems.length;
   
        cy.dataCy('story-group-menu-item', groupName)
            .findCy('add-story-in-story-group')
            .click({ force: true });
        
        // we check that one node was indeed added
        cy.dataCy('story-group-menu-item').should('have.length', len + 1);

        // this part might execute before the add story complete, that why we are checking the length just above
        // so we are sure that this will only be executed once the story has been added
        cy.dataCy('story-group-menu-item', groupName).then((n) => {
            if (n.next().attr('type') === 'story-group') cy.wrap([]).as('stories');
            else cy.wrap(n.nextUntil('[type="story-group"]')).as('stories');
            cy.get('@stories').then((stories) => {
                cy.dataCy('story-group-menu-item').contains(`${groupName} (${stories.length})`);
                findStoryAndSelect(`${groupName} (${stories.length})`, 'new-story');
            });

            if (storyName) renameStoryOrGroup('new-story', storyName);
        });
    });
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

Cypress.Commands.add('addUtteranceLine', ({
    intent, entities = null,
}) => {
    cy.dataCy('user-line-from-payload').last().click({ force: true });
    cy.dataCy('payload-editor').find('[data-cy=intent-label]').click();
    cy.dataCy('intent-dropdown').find('input')
        .type(`${intent}{enter}`);
    if (entities) {
        entities.forEach((entity) => {
            cy.dataCy('add-entity').click();
            cy.dataCy('entity-dropdown').click();
            cy.dataCy('entity-dropdown').find('input').type(`${entity.name}{enter}`);
            cy.dataCy('entity-value-input').click().type(`${entity.value}{enter}`);
        });
    }
    cy.dataCy('save-user-utterance').click();
});

Cypress.Commands.add('checkMenuItemAtIndex', (index, string, ignorePinned = true) => {
    /*
        the default rety behaviour is to retry the command before the .should
        this means dataCy().eq().should does NOT requery the dom when it retries.
        if the first attempt doesn't succeed none of them will

        to fix this we put the element at index check in the callback of a
        should function so the dataCy query is retried.  this is only
        needed for the first .eq after a change.
    */
    cy.dataCy('story-group-menu-item').should((els) => {
        const filtered = ignorePinned
            ? Array.from(els).filter(el => el.attributes['data-pinned'].value !== 'true')
            : Array.from(els);
        expect(filtered[index].innerText).to.be.equal(string);
    });
});

Cypress.Commands.add('createCustomStoryGroup', (projectId, storyGroupId, name) => {
    const storyGroup = {
        projectId,
        name,
        _id: storyGroupId,
        isExpanded: true,
        pinned: false,
        children: [],
    };
    cy.MeteorCall('storyGroups.insert', [storyGroup]);
});

Cypress.Commands.add('createCustomStory', (projectId, storyGroupId, storyId, options = {}) => {
    const {
        title = storyId, steps = [], branches = [], triggerIntent,
    } = options;
    const storyData = {
        title,
        steps,
        type: 'story',
        _id: storyId,
        storyGroupId,
        projectId,
        status: 'published',
        branches,
        ...(triggerIntent ? { triggerIntent } : {}),
    };
    cy.MeteorCall('stories.insert', [storyData]);
});
