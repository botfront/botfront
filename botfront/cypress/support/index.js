/* global cy Cypress:true */
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

import './chat.commands';
import './nlu.commands';
import './story.commands';
import './response.commands';
import './incoming.commands';
import './settings.commands';
import './conversation.commands';
import './slot.commands';

const axios = require('axios');
require('cypress-plugin-retries');

Cypress.on('uncaught:exception', () => false);

Cypress.Screenshot.defaults({
    screenshotOnRunFailure: !!JSON.parse(String(Cypress.env('SCREENSHOTS')).toLowerCase()),
});

switch (Cypress.env('abort_strategy')) {
case 'run':
    // eslint-disable-next-line no-undef
    before(function onBeforeEach() {
        // Skips any subsequent specs, if the run has been flagged as failed
        cy.getCookie('has_failed_test').then((cookie) => {
            if (cookie && typeof cookie === 'object' && cookie.value === 'true') {
                Cypress.runner.stop();
            }
        });
    });
    /* fallthrough */
case 'spec':
    afterEach(function onAfterEach() {
        // Skips all subsequent tests in a spec, and flags the whole run as failed
        if (this.currentTest.state === 'failed') {
            cy.setCookie('has_failed_test', 'true');
            Cypress.runner.stop();
        }
    });
    Cypress.Cookies.defaults({
        whitelist: 'has_failed_test',
    });
    break;
default:
}

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
        ({ Meteor, Accounts }) => new Cypress.Promise((resolve, reject) => {
            Meteor.loginWithPassword(email, password, (loginError) => {
                if (loginError) return reject(loginError);
                cy.wrap(Accounts._storedLoginToken()).as('loginToken'); // eslint-disable-line no-underscore-dangle
                return resolve();
            });
        }),
    );
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

Cypress.Commands.add('createNLUModelProgramatically', (projectId, name, language) => cy.window()
    .then(({ Meteor }) => cy.fixture('lite-pipeline.yaml').then(config => Meteor.callWithPromise(
        'nlu.insert',
        projectId,
        language,
        config,
    ))));

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

Cypress.Commands.add('deleteNLUModel', (projectId, name, language) => {
    cy.visit(`/project/${projectId}/nlu/models`);
    cy.contains(language).click();
    cy.get(`#model-${name} [data-cy=open-model]`)
        .first()
        .click();
    cy.dataCy('nlu-menu-settings').click();
    cy.contains('Delete').click();
    cy.dataCy('nlu-menu-settings').click();
    cy.get('.dowload-model-backup-button').click();
    cy.get('.delete-model-button').click();
    cy.get('.ui.page.modals').should('be.visible');
    cy.get('.ui.page.modals .primary').click();
});

Cypress.Commands.add('createResponse', (projectId, responseName) => {
    cy.visit(`/project/${projectId}/responses/add`);
    cy.get('[data-cy=response-name] input').type(responseName);
    cy.get('.response-message-next.sequence-add-message').click();
    cy.get('.response-message-next.sequence-add-message')
        .contains('Text')
        .click();
    cy.get('.response-save-button').click();
});


Cypress.Commands.add('openResponse', (projectId, responseName) => {
    cy.visit(`/project/${projectId}/responses`);
    // Type bot response name in filter
    cy.get('[style="flex: 200 0 auto; width: 200px; max-width: 200px;"] > input').clear();
    cy.get('[style="flex: 200 0 auto; width: 200px; max-width: 200px;"] > input').type(responseName);
    cy.get('[data-cy=edit-response-0]').click();
});

Cypress.Commands.add('deleteResponse', (projectId, responseName) => {
    cy.visit(`/project/${projectId}/responses`);
    // Type bot response name in filter
    cy.get('[style="flex: 200 0 auto; width: 200px; max-width: 200px;"] > input').clear();
    cy.get('[style="flex: 200 0 auto; width: 200px; max-width: 200px;"] > input').type(responseName);
    cy.get('[data-cy=remove-response-0]').click();
});

Cypress.Commands.add('deleteProject', projectId => cy.visit('/')
    .then(() => cy.window())
    .then(({ Meteor }) => Meteor.callWithPromise('project.delete', projectId, { failSilently: true })));


Cypress.Commands.add('createProject', (projectId = 'bf', name = 'My Project', defaultLanguage = 'en') => {
    const project = {
        _id: projectId,
        name,
        defaultLanguage,
        languages: [],
    };
    cy.deleteProject(projectId);
    cy.visit('/');
    return cy.fixture('lite-policies.yaml')
        .then(policies => cy.window()
            .then(async ({ Meteor }) => {
                await Meteor.callWithPromise('project.insert', project);
                await Meteor.callWithPromise('policies.save', {
                    projectId,
                    policies,
                });
                return cy.createNLUModelProgramatically(projectId, '', defaultLanguage);
            }));
});

Cypress.Commands.add('dataCy', (dataCySelector, content = null, filter = null) => {
    let result;
    if (!content) result = cy.get(`[data-cy=${dataCySelector}]`);
    else result = cy.get(`[data-cy=${dataCySelector}]:contains(${content})`);
    const filtered = filter ? result.filter(filter) : result;
    if (filtered.length > 1) { // go for exact match
        return filtered.contains(
            new RegExp(`^${content.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
        );
    }
    return filtered;
});

Cypress.Commands.add('findCy', { prevSubject: 'element' }, (subject, dataCySelector) => subject.find(`[data-cy=${dataCySelector}]`));

Cypress.Commands.add('escapeModal', (letFail = false) => {
    cy.get('.modals.dimmer').click('topRight');
    if (!letFail) cy.get('.dimmer').should('not.exist');
});

Cypress.Commands.add('yesToConfirmation', () => cy.get('.modals.dimmer').should('exist').find('.ui.primary.button').click());

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
            const dataTransfer = {
                dataTransfer: { files: [testFile], types: ['Files'] },
            };
            cy.wrap(subject).trigger('dragenter', dataTransfer);
            cy.wrap(subject).trigger('drop', dataTransfer);
        });
    },
);

Cypress.Commands.add(
    'dragTo',
    { prevSubject: 'element' },
    (source, node, dataCy = true) => {
        cy.wrap(source).trigger('dragstart');
        (dataCy ? cy.dataCy(node) : cy.get(node)).then((destination) => {
            cy.wrap(destination).trigger('dragenter');
            cy.wrap(destination).trigger('drop');
        });
    },
);

Cypress.Commands.add('waitForResolve', (url, maxTries = 1000) => new Cypress.Promise(async function (resolve, reject) {
    for (let i = 1; i < Number.MAX_VALUE; i += 1) {
        try {
            await axios(url);
            resolve();
            break;
        } catch (error) {
            if (!error.toString().includes('ERR_EMPTY_RESPONSE')) { resolve(); break; }
            if (i > maxTries) reject(`Can't connect to ${url}`);
        }
    }
}));

Cypress.Commands.add('getWindowMethod', (methodName) => {
    cy.window().then(window => new Cypress.Promise((resolve, reject) => {
        let i = 0;
        const checkIfExists = () => {
            if (i > 200) return reject();
            if (window[methodName]) return resolve(window[methodName]);
            i += 1;
            return setTimeout(checkIfExists, 50);
        };
        checkIfExists();
    }));
});

Cypress.Commands.add('import', (projectId = 'bf', fixture, fallbackLang = 'en', wipeCurrent = false) => {
    cy.fixture(fixture, 'utf8').then((loadedFixture) => {
        let file = typeof loadedFixture === 'string' ? loadedFixture : JSON.stringify(loadedFixture);
        file = new File([file], fixture);
        file.filename = fixture;
        cy.graphQlQuery(
            `mutation import($projectId: String!, $files: [Upload]!, $wipeCurrent: Boolean = false, $fallbackLang: String!) {
                import(projectId: $projectId, files: $files, wipeCurrent: $wipeCurrent, fallbackLang: $fallbackLang) {  
                    summary { text, longText }
                }
            }`,
            {
                projectId, fallbackLang, wipeCurrent, files: [file],
            },
        );
    });
    return cy.wait(500);
});

Cypress.Commands.add('train', (waitTime = 300000) => {
    cy.visit('/project/bf/dialogue');
    cy.dataCy('train-button').should('exist').should('not.have.class', 'disabled');
    cy.wait(1500);
    cy.dataCy('train-button').click({ force: true });
    cy.dataCy('train-button').should('have.class', 'disabled');
    cy.get('[data-cy=train-button]', { timeout: waitTime }).should('not.have.class', 'disabled');
});

const objectToFormData = (obj) => {
    // this traverses the query/variables object and makes it graphql-upload-compliant
    // cf. https://github.com/jaydenseric/graphql-multipart-request-spec#curl-request
    const formData = new FormData();
    const foundFiles = {};
    const fileDigger = (input, path = '') => {
        if (input instanceof File) {
            foundFiles[path] = input;
            return null;
        }
        if (Array.isArray(input)) {
            return input.map((child, i) => fileDigger(child, `${path}.${i}`, foundFiles));
        }
        if (input && typeof input === 'object') {
            return Object.entries(input).reduce((acc, [k, v]) => ({
                ...acc,
                [k]: fileDigger(v, `${path}${path ? '.' : ''}${k}`, foundFiles),
            }), {});
        }
        return input;
    };
    const dug = fileDigger(obj);
    formData.append('operations', JSON.stringify({ operationName: null, ...dug }));
    const map = {};
    const files = [];
    Object.entries(foundFiles).forEach(([k, v], i) => {
        map[i] = [k]; files.push([i, v]);
    });
    formData.append('map', JSON.stringify(map));
    files.forEach(([i, v]) => formData.append(i, v));
    return formData;
};

Cypress.Commands.add('graphQlQuery', (query, variables) => cy.get('@loginToken').then((token) => {
    const formData = objectToFormData({ variables, query });
    // cy.request({
    //     method: 'POST',
    //     url: '/graphql',
    //     headers: { 'Content-Type': 'application/json', Authorization: token },
    //     body: { query, variables },
    // });
    cy.formRequest('post', '/graphql', formData, token);
}));

Cypress.Commands.add('formRequest', (method, url, formData, authorization) => new Cypress.Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Authorization', authorization);
    xhr.onload = () => resolve(xhr);
    xhr.onerror = () => reject(xhr);
    xhr.send(formData);
}));

Cypress.Commands.add('insertNluExamples', (projectId, language = 'en', examples, autoAssignCanonical = true) => cy.graphQlQuery(
    `mutation insertExamples($projectId: String!, $language: String!, $examples: [ExampleInput]!, $autoAssignCanonical: Boolean) {
        insertExamples(projectId: $projectId, language: $language, examples: $examples, autoAssignCanonical: $autoAssignCanonical) {  
            _id
        }
    }`,
    {
        projectId, language, examples, autoAssignCanonical,
    },
));

Cypress.Commands.add('addConversation', (projectId, id, conversation, env = 'development') => cy.graphQlQuery(
    `mutation ($tracker: Any) {\n  insertTrackerStore(senderId: "${id}", projectId: "${projectId}", tracker: $tracker, env: ${env}){\n  lastIndex\n  }\n}`,
    { tracker: conversation },
));

Cypress.Commands.add('updateConversation', (projectId, id, conversation) => cy.graphQlQuery(
    `mutation ($tracker: Any) {\n  updateTrackerStore(senderId: "${id}", projectId: "${projectId}", tracker: $tracker){\n  lastIndex\n  }\n}`,
    { tracker: conversation },
));

Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message));

Cypress.Commands.add('getBranchContainer', (depth) => {
    /*
    gets the contents of a branch including contents of following branches
    and branch menus. this does not include the specified branches branch-menu
    */
    let branch = cy.dataCy('single-story-editor').first();
    for (let i = 0; i < depth; i += 1) {
        branch = branch.find('[data-cy=single-story-editor]').first();
    }
    return branch;
});

// get the contents of the visual editor for a branch
Cypress.Commands.add('getBranchEditor', depth => cy.getBranchContainer(depth).find('.story-visual-editor').first());

Cypress.Commands.add('fill', {
    prevSubject: 'element',
}, ($subject, value) => {
    const el = $subject[0];
    el.value = value;
    return cy.wrap($subject).type('t{backspace}'); // adding/removing character trigger the one change
});

Cypress.Commands.add('setPolicies', (projectId, policies) => {
    cy.MeteorCall('policies.save', [{ projectId, policies }]);
});
