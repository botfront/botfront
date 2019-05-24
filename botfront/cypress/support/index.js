/* eslint-disable no-undef */
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

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.Commands.add('login', (email = 'test@test.com', password = 'Aaaaaaaa00') => {
    cy.visit('/');
    cy.window()
        .then(
            ({ Meteor }) => new Cypress.Promise((resolve, reject) => {
                Meteor.logout((err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }),
        )
        .then(
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
                resolve();
            });
        }),
    );
});

Cypress.Commands.add('MeteorCallAdmin', (method, args) => {
    cy.login();
    cy.window().then(
        ({ Meteor }) => new Cypress.Promise((resolve) => {
            Meteor.call(method, ...args, (err, res) => {
                if (err) resolve(err);
                resolve(res);
            });
        }),
    );
    cy.logout();
});

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

Cypress.Commands.add('createNLUModelWithImport', (projectId, name, language, description, instance) => {
    cy.createNLUModel(projectId, name, language, description, instance);
    cy.fixture('bf_project_id.txt').then((id) => {
        cy.visit(`/project/${id}/nlu/models`);
    });
    cy.contains('French').click();
    cy.get(':nth-child(1) > .extra > .basic > .primary').click();
    cy.get('.nlu-menu-settings').click();
    cy.contains('Import').click();
    cy.fixture('nlu_import.json', 'utf8').then((content) => {
        cy.get('.file-dropzone').upload(content, 'data.json');
    });

    cy.contains('Import Training Data').click();
});

Cypress.Commands.add('deleteNLUModel', (projectId, name, language) => {
    cy.visit(`/project/${projectId}/nlu/models`);
    cy.contains(language).click();
    cy.get(`#model-${name} .open-model-button`)
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
    cy.window().then(({ Meteor }) => Meteor.call('project.insertTemplate', projectId, {
        key: responseName,
        values: [{ sequence: [], lang: 'en' }, { sequence: [], lang: 'fr' }],
    }));
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
    cy.window().then(({ Meteor }) => Meteor.call('project.deleteTemplate', projectId, key));
});

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

Cypress.Commands.add('createUser', (lastName, email, roles, projectId) => {
    cy.visit('/');
    cy.window()
        .then(
            ({ Meteor }) => new Cypress.Promise((resolve, reject) => {
                Meteor.call(
                    'user.create',
                    {
                        profile: {
                            firstName: 'test',
                            lastName,
                        },
                        email,
                        roles: [
                            {
                                project: projectId,
                                roles,
                            },
                        ],
                        sendEmail: false,
                    },
                    true,
                    (err, result) => {
                        if (err) {
                            reject(err);
                        }
                        resolve({ Meteor, result });
                    },
                );
            }),
        )
        .then(
            ({ Meteor, result }) => new Cypress.Promise((resolve) => {
                Meteor.call('user.changePassword', result, 'Aaaaaaaa00', (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve({ Meteor, result });
                });
            }),
        );
});

Cypress.Commands.add('deleteUser', (email) => {
    cy.login();
    cy.visit('/');
    cy.window().then(
        ({ Meteor }) => new Cypress.Promise((resolve) => {
            try {
                Meteor.call('user.removeByEmail', email, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    resolve(result);
                });
            } catch (e) {
                throw err;
            }
        }),
    );
});

Cypress.Commands.add('loginTestUser', (email = 'testuser@test.com', password = 'Aaaaaaaa00') => {
    // cy.visit('/');
    cy.window()
        .then(
            ({ Meteor }) => new Cypress.Promise((resolve, reject) => {
                Meteor.logout((err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }),
        )
        .then(
            ({ Meteor }) => new Cypress.Promise((resolve, reject) => {
                Meteor.loginWithPassword(email, password, loginError => (loginError ? reject(loginError) : resolve()));
            }),
        );
});

Cypress.Commands.add('loginViewer', (email = 'viewer@test.com', password = 'Aaaaaaaa00') => {
    cy.visit('/');
    cy.window()
        .then(
            ({ Meteor }) => new Cypress.Promise((resolve, reject) => {
                Meteor.logout((err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }),
        )
        .then(
            ({ Meteor }) => new Cypress.Promise((resolve, reject) => {
                Meteor.loginWithPassword(email, password, loginError => (loginError ? reject(loginError) : resolve()));
            }),
        );
});

Cypress.Commands.add('loginEditor', (email = 'editor@test.com', password = 'Aaaaaaaa00') => {
    cy.visit('/');
    cy.window()
        .then(
            ({ Meteor }) => new Cypress.Promise((resolve, reject) => {
                Meteor.logout((err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }),
        )
        .then(
            ({ Meteor }) => new Cypress.Promise((resolve, reject) => {
                Meteor.loginWithPassword(email, password, loginError => (loginError ? reject(loginError) : resolve()));
            }),
        );
});

Cypress.Commands.add('loginAdmin', (email = 'admin@test.com', password = 'Aaaaaaaa00') => {
    cy.visit('/');
    cy.window()
        .then(
            ({ Meteor }) => new Cypress.Promise((resolve, reject) => {
                Meteor.logout((err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }),
        )
        .then(
            ({ Meteor }) => new Cypress.Promise((resolve, reject) => {
                Meteor.loginWithPassword(email, password, loginError => (loginError ? reject(loginError) : resolve()));
            }),
        );
});

Cypress.Commands.add('addTestActivity', (modelId) => {
    const commandToAddActivity = `mongo meteor --host localhost:3001 --eval "db.activity.insert({ 
        _id:'TestActivity',
        text: 'bonjour , avez vous un f1 à lyon autour de l apardieu ?',
        intent: 'faq.find_hotel',
        entities:[
    
        ],
        confidence:{
        '$numberDouble' :'0.7438368201255798'
        },
        modelId: '${modelId}',
        createdAt:{
        '$date' :{
            numberLong: '1557323537346'
        }
        },
        updatedAt:{
        '$date':{
            '$numberLong': '1557323537346'
        }
        },
        __v:{
        '$numberInt': '0'
        }
    });"`;
    cy.exec(commandToAddActivity);
    cy.exec(`mongo meteor --host localhost:3001 --eval 'db.nlu_models.update({ _id: "${modelId}"}, { $set: { "training.endTime": "123" } });'`);
});

Cypress.Commands.add('removeTestActivity', (modelId) => {
    cy.MeteorCallAdmin('activity.deleteExamples', [modelId, ['TestActivity']]);
});
