/* eslint-disable no-undef */
/* eslint-disable no-await-in-loop */
// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands';

const axios = require('axios');
require('cypress-plugin-retries');

Cypress.on('uncaught:exception', () => false);

Cypress.Commands.add('login', (visit = true, email = 'test@test.com', password = 'Aaaaaaaa00') => {
    if (visit) cy.visit('/');
    cy.window().then(
        ({ Meteor }) => new Cypress.Promise((resolve, reject) => {
            Meteor.logout((err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        }),
    ).then(
        ({ Meteor }) => new Cypress.Promise((resolve, reject) => {
            Meteor.loginWithPassword(email, password, loginError => (loginError ? reject(loginError) : resolve()));
        }),
    );

    // cy.window();
});

Cypress.Commands.add('logout', () => {
    cy.window().then(
        ({ Meteor }) => new Cypress.Promise((resolve, reject) => {
            Meteor.logout((err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        }),
    );
});

Cypress.Commands.add('createNLUModel', (projectId, name, language, description, instance = false) => {
    cy.visit(`/project/${projectId}/nlu/models`);
    cy.get('.new-model').click();
    cy.get('#uniforms-0000-0001').type(name);
    cy.get('#uniforms-0000-0002 > .search').click();
    cy.get('#uniforms-0000-0002 > .search').type(language);
    cy.get('#uniforms-0000-0002')
        .contains(language)
        .click();
    if (description) cy.get('#uniforms-0000-0004').type(description);
    if (instance) {
        cy.get('#uniforms-0000-0005').click();
        cy.get('#uniforms-0000-0005')
            .find('[role=option]')
            .first()
            .click();
        // Save
    }
    cy.get('[data-cy=model-save-button]').click();
});

Cypress.Commands.add('createNLUModelProgramatically', (projectId, name, language, description) => cy.window()
    .then(({ Meteor }) => Meteor.callWithPromise('nlu.insert', { name, language, description }, projectId)));

Cypress.Commands.add('MeteorCall', (method, args) => {
    cy.window().then(
        ({ Meteor }) => new Cypress.Promise((resolve) => {
            Meteor.call(method, ...args, (err, res) => {
                if (err) resolve(err);
                resolve(res);
            });
        }),
    );
});

// Cypress.Commands.add('createNLUModelWithImport', (projectId, name, language, description) => {
//     let modelId = '';
//     cy.createNLUModelProgramatically(projectId, name, language, description)
//         .then((result) => {
//             modelId = result;
//             cy.fixture('bf_project_id.txt').then((id) => {
//                 cy.visit(`/project/${id}/nlu/model/${modelId}`);
//             });
//             cy.get('.nlu-menu-settings').click();
//             cy.contains('Import').click();
//             cy.fixture('nlu_import.json', 'utf8').then((content) => {
//                 cy.get('.file-dropzone').upload(content, 'data.json');
//             });
        
//             cy.contains('Import Training Data').click();
//         });
// });

Cypress.Commands.add('deleteNLUModel', (projectId, name, language) => {
    cy.visit(`/project/${projectId}/nlu/models`);
    cy.contains(language).click();
    cy.get(`#model-${name} [data-cy=open-model]`)
        .first()
        .click();
    cy.get('.nlu-menu-settings').click();
    cy.contains('Delete').click();
    cy.get('.nlu-menu-settings').click();
    cy.get('.dowload-model-backup-button').click();
    cy.get('.delete-model-button').click();
    cy.get('.ui.page.modals').should('be.visible');
    cy.get('.ui.page.modals .primary').click();
});

Cypress.Commands.add('deleteNLUModelProgramatically', (modelId, projectId, language) => {
    if (!language) {
        cy.MeteorCall('nlu.remove', [
            `${modelId}`,
            `${projectId}`,
        ]);
    } else {
        cy.MeteorCall('nlu.removelanguage', [
            `${projectId}`,
            language,
        ]);
    }
});

Cypress.Commands.add('createResponse', (projectId, responseName) => {
    cy.visit(`/project/${projectId}/dialogue/templates/add`);
    cy.get('[data-cy=response-name] input').type(responseName);
    cy.get('.response-message-next.sequence-add-message').click();
    cy.get('.response-message-next.sequence-add-message')
        .contains('Text')
        .click();
    cy.get('.response-save-button').click();
});

Cypress.Commands.add('createResponseFast', (projectId, responseName) => {
    cy.window().then(({ Meteor }) => Meteor.call(
        'project.insertTemplate',
        projectId,
        {
            key: responseName,
            values: [{ sequence: [], lang: 'en' }, { sequence: [], lang: 'fr' }],
        },
    ));
});

Cypress.Commands.add('openResponse', (projectId, responseName) => {
    cy.visit(`/project/${projectId}/dialogue/templates`);
    // Type bot response name in filter
    cy.get('[style="flex: 200 0 auto; width: 200px; max-width: 200px;"] > input').clear();
    cy.get('[style="flex: 200 0 auto; width: 200px; max-width: 200px;"] > input').type(responseName);
    cy.get('[data-cy=edit-response-0]').click();
});

Cypress.Commands.add('deleteResponse', (projectId, responseName) => {
    cy.visit(`/project/${projectId}/dialogue/templates`);
    // Type bot response name in filter
    cy.get('[style="flex: 200 0 auto; width: 200px; max-width: 200px;"] > input').clear();
    cy.get('[style="flex: 200 0 auto; width: 200px; max-width: 200px;"] > input').type(responseName);
    cy.get('[data-cy=remove-response-0]').click();
});

Cypress.Commands.add('deleteResponseFast', (projectId, key) => {
    cy.window().then(({ Meteor }) => Meteor.call(
        'project.deleteTemplate',
        projectId,
        key,
    ));
});

Cypress.Commands.add('createProject', (projectId = 'bf', name = 'My Project', defaultLanguage = 'en') => {
    const project = {
        _id: projectId,
        name,
        defaultLanguage,
    };
    return cy.visit('/')
        .then(() => cy.window())
        .then(({ Meteor }) => Meteor.callWithPromise('project.insert', project))
        .then(() => cy.createNLUModelProgramatically(projectId, '', defaultLanguage));
});

Cypress.Commands.add('deleteProject', projectId => cy.visit('/')
    .then(() => cy.window())
    .then(({ Meteor }) => Meteor.callWithPromise('project.delete', projectId, { failSilently: true })));

Cypress.Commands.add('dataCy', dataCySelector => cy.get(`[data-cy=${dataCySelector}]`));

Cypress.Commands.add(
    'upload',
    {
        prevSubject: 'element',
    },
    (subject, file, fileName) => {
        // we need access window to create a file below

        cy.window().then((window) => {
            const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'text/plain;charset=utf-8' });
            // Please note that we need to create a file using window.File,
            // cypress overwrites File and this is not compatible with our change handlers in React Code
            const testFile = new window.File([blob], fileName);
            cy.wrap(subject).trigger('drop', {
                dataTransfer: { files: [testFile], types: ['Files'] },
            });
        });
    },
);

Cypress.Commands.add('waitForResolve', (url, maxTries = 1000) => new Cypress.Promise(async function(resolve, reject) {
    for (let i = 1; i < Number.MAX_VALUE; i += 1) {
        try {
            await axios(url);
            resolve();
        } catch (error) {
            if (!error.toString().includes('ERR_EMPTY_RESPONSE')) resolve();
            if (i > maxTries) reject(`Can't connect to ${url}`);
        }
    }
}));
