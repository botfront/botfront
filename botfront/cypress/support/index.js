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

Cypress.Commands.add('deleteProject', projectId => cy.visit('/')
    .then(() => cy.login())
    .then(() => cy.window())
    .then(({ Meteor }) => Meteor.callWithPromise('project.delete', projectId, { failSilently: true, bypassWithCI: true })));


Cypress.Commands.add('createProject', (projectId = 'bf', name = 'My Project', defaultLanguage = 'en') => {
    const project = {
        _id: projectId,
        name,
        defaultLanguage,
        namespace: `bf-${projectId}`,
    };
    cy.deleteProject(projectId);
    return cy.visit('/')
        .then(() => cy.login())
        .then(() => cy.window())
        .then(({ Meteor }) => Meteor.callWithPromise('project.insert', project, true)) // true is used to bypass role check. CI env must be set when running Botfront
        .then(() => cy.createNLUModelProgramatically(projectId, '', defaultLanguage));
});

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
                // eslint-disable-next-line consistent-return
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
                // eslint-disable-next-line consistent-return
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

Cypress.Commands.add('addTestActivity', (modelId, projectId) => {
    const futureDate = new Date().getTime() + 3600 * 1000; // this is so activity is not outdated at insertion time
    const commandToAddActivity = `mongo meteor --host localhost:3001 --eval "db.activity.insert({ 
        _id:'TestActivity',
        text: 'bonjour , avez vous un f1 à lyon autour de l apardieu ?',
        intent: 'faq.find_hotel',
        entities:[
        ],
        confidence: '0.50',
        modelId: '${modelId}',
        createdAt: '${futureDate}',
        updatedAt: '${futureDate}',
        __v:{
        '$numberInt': '0'
        }
    });"`;
    cy.exec(commandToAddActivity);
    cy.exec(`mongo meteor --host localhost:3001 --eval 'db.projects.update({ _id: "${projectId}"}, { $set: { "training.endTime": "123" } });'`);
});

Cypress.Commands.add('removeTestActivity', (modelId) => {
    cy.MeteorCallAdmin('activity.deleteExamples', [modelId, ['TestActivity']]);
});

Cypress.Commands.add('addTestConversation', (projectId) => {
    const commandToAddConversation = `mongo meteor --host localhost:3001 --eval "db.conversations.insert({
        _id:'6f1800deea7f469b8dafd928f092a280',
        tracker:{
           events:[

           ],
           slots:{
              latest_response_name:null,
              followup_response_name:null,
              parse_data:null
           },
           latest_input_channel:'socketio',
           paused:false,
           followup_action:null,
           latest_message:{
              text:'/get_started',
              entities:[
     
              ],
              intent_ranking:[
                 {
                    name:'get_started',
                    confidence:{
                       '$numberInt':'1'
                    }
                 }
              ],
              intent:{
                 name:'get_started',
                 confidence:{
                    '$numberInt':'1'
                 }
              }
           },
           sender_id:'6f1800deea7f469b8dafd928f092a280',
           latest_event_time:{
              '$numberDouble':'1551194858.7705371'
           },
           latest_action_name:'action_listen'
        },
        status:'read',
        projectId:'${projectId}',
        createdAt:{
           '$date':{
              '$numberLong':'1551194858732'
           }
        },
        updatedAt:{
           '$date':{
              '$numberLong':'1551194858788'
           }
        }
    });"`;
    cy.exec(commandToAddConversation);
});

Cypress.Commands.add('removeTestConversationEnv', (id) => {
    cy.MeteorCallAdmin('conversations.delete', [id]);
});

Cypress.Commands.add('addTestConversationToEnv', (projectId, id = 'abc', env = null) => {
    const body = JSON.stringify({
        conversations: [{
            _id: id,
            env,
            tracker: {
                events: [

                ],
                slots: {
                    latest_response_name: null,
                    followup_response_name: null,
                    parse_data: null,
                },
                latest_input_channel: 'socketio',
                paused: false,
                followup_action: null,
                latest_message: {
                    text: '/get_started',
                    entities: [
     
                    ],
                    intent_ranking: [
                        {
                            name: 'get_started',
                            confidence: 1,
                        },
                    ],
                    intent: {
                        name: 'get_started',
                        confidence: 1,
                    },
                },
                sender_id: '6f1800deea7f469b8dafd928f092a280',
                latest_event_time: '2019-10-08T18:52:46.343Z',
                latest_action_name: 'action_listen',
            },
            status: 'read',
            projectId,
            createdAt: '2019-10-08T18:52:46.343Z',
            updatedAt: '2019-10-08T18:52:46.343Z',
        }],
        processNlu: true,
    });

    cy.request({
        method: 'POST',
        url: `http://localhost:8080/conversations/bf/environment/${env}?apiKey=`,
        headers: { 'Content-Type': 'application/json' },
        body,
    });
});

Cypress.Commands.add('removeTestConversation', () => {
    cy.MeteorCallAdmin('conversations.delete', ['6f1800deea7f469b8dafd928f092a280']);
});

Cypress.Commands.add('addTestResponse', (id) => {
    const commandToAddResponse = `mongo meteor --host localhost:3001 --eval 'db.projects.update({
        _id: "${id}"
    }, {
        $set: {
            templates: [
                {
                    values:[
                        {
                            sequence:[
                                {
                                    content:"text: Test"
                                }
                            ],
                            lang:"en"
                        }
                    ],
                    key:"utter_greet",
                    match:{
                        nlu:[
                            {
                                intent:"chitchat.greet",
                                entities:[
        
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    });'`;
    cy.exec(commandToAddResponse);
});

Cypress.Commands.add('removeTestResponse', (id) => {
    const commandToRemoveResponse = `mongo meteor --host localhost:3001 --eval 'db.projects.update({
        _id: "${id}"
    }, {
        $set: {
            templates: [
            ]
        }
    });'`;
    cy.exec(commandToRemoveResponse);
});

Cypress.Commands.add('addStory', (projectId) => {
    const commandToAddStory = `mongo meteor --host localhost:3001 --eval "db.stories.insert({
        storyGroupId: 'StoryGroupId',
        projectId: '${projectId}', 
        story: '## somestory',
    });"`;
    cy.exec(commandToAddStory);
});

Cypress.Commands.add('addStoryGroup', (projectId) => {
    const commandToAddStory = `mongo meteor --host localhost:3001 --eval "db.storyGroups.insert({
        _id: 'StoryGroupId',
        projectId: '${projectId}', 
        name: 'TestName',
    });"`;
    cy.exec(commandToAddStory);
});

Cypress.Commands.add('removeStory', () => {
    const commandToRemoveStory = 'mongo meteor --host localhost:3001 --eval "db.stories.remove({ storyGroupId: \'StoryGroupId\'});"';
    cy.exec(commandToRemoveStory);
});

Cypress.Commands.add('removeStoryGroup', () => {
    const commandToRemoveStory = 'mongo meteor --host localhost:3001 --eval "db.storyGroups.remove({ _id: \'StoryGroupId\'});"';
    cy.exec(commandToRemoveStory);
});

// Add and remove slot programatically.
Cypress.Commands.add('addSlot', (projectId) => {
    const commandToAddStory = `mongo meteor --host localhost:3001 --eval "db.slots.insert({
        _id: 'DELETESLOT',
        projectId: '${projectId}',
        name: 'Test',
        type: 'bool',
    });"`;
    cy.exec(commandToAddStory);
});

Cypress.Commands.add('removeSlot', () => {
    const commandToRemoveStory = 'mongo meteor --host localhost:3001 --eval "db.slots.remove({ _id: \'DELETESLOT\'});"';
    cy.exec(commandToRemoveStory);
});

Cypress.Commands.add('addIntent', () => {
    const commandToRemoveStory = 'mongo meteor --host localhost:3001 --eval "db.slots.remove({ _id: \'DELETESLOT\'});"';
    cy.exec(commandToRemoveStory);
});

Cypress.Commands.add('addTrainingData', (modelId, language) => {
    cy.MeteorCall(
        'nlu.addChitChatToTrainingData',
        [
            modelId,
            language,
            ['basics.no'],
        ],
    );
});
Cypress.Commands.add('waitForResolve', (url, maxTries = 1000) => new Cypress.Promise(async function(resolve, reject) {
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

Cypress.Commands.add('importProject', (projectId = 'bf', fixture) => cy.fixture(fixture, 'utf8')
    .then((data) => {
        axios.put(
            `${Cypress.env('API_URL')}/project/${projectId}/import`,
            data,
        ).then((response) => {
            if (response.status !== 200) throw new Error();
        });
    }));

Cypress.Commands.add('importNluData', (projectId = 'bf', fixture, langName = 'English') => {
    cy.visit(`/project/${projectId}/nlu/models`);
    cy.get('[data-cy=model-selector]').click();
    cy.get('[data-cy=model-selector] input').type(`${langName}{enter}`);
    cy.get('.nlu-menu-settings').click();
    cy.contains('Import').click({ force: true });
    cy.fixture(fixture, 'utf8').then((content) => {
        cy.get('.file-dropzone').upload(content, 'data.json');
    });
    cy.contains('Import Training Data').click();
    cy.get('.s-alert-success').should('be.visible');
    return cy.wait(500);
});

Cypress.Commands.add('train', () => {
    cy.visit('/project/bf/stories');
    cy.dataCy('train-button').click();
    cy.wait(5000);
    cy.dataCy('train-button').should('not.have.class', 'disabled');
});
