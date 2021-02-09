/* global Cypress cy: true */
// good luck debugging this failing test!!!

// eslint-disable-next-line max-len
const resultingEndpoints = '# This file contains the different endpoints your bot can use.# Server where the models are pulled from.# https://rasa.com/docs/rasa/user-guide/running-the-server/#fetching-models-from-a-server/#models:#  url: http://my-server.com/models/default_core@latest#  wait_time_between_pulls:  10   # [optional](default: 100)# Server which runs your custom actions.# https://rasa.com/docs/rasa/core/actions/#custom-actions/action_endpoint: url: "http://localhost:5055/webhook"# Tracker store which is used to store the conversations.# By default the conversations are stored in memory.# https://rasa.com/docs/rasa/api/tracker-stores/#tracker_store:#    type: redis#    url: <host of the redis instance, e.g. localhost>#    port: <port of your redis instance, usually 6379>#    db: <number of your database within redis, e.g. 0>#    password: <password used for authentication>#    use_ssl: <whether or not the communication is encrypted, default false>#tracker_store:#    type: mongod#    url: <url to your mongo instance, e.g. mongodb://localhost:27017>#    db: <name of the db within your mongo instance, e.g. rasa>#    username: <username used for authentication>#    password: <password used for authentication># Event broker which all conversation events should be streamed to.# https://rasa.com/docs/rasa/api/event-brokers/#event_broker:#  url: localhost#  username: username#  password: password#  queue: queue';
// eslint-disable-next-line max-len
const resultingCredentials = 'rasa_addons.core.channels.webchat.WebchatInputTest:  session_persistence: true  base_url: \'http://localhost:5005\'  socket_path: /socket.io/rasa_addons.core.channels.bot_regression_test.BotRegressionTestInput: {}';
// eslint-disable-next-line max-len
const resultingDefaultDomain = 'slots:  disambiguation_message:    type: unfeaturized  test_message_a:    type: unfeaturized  test_message_b:    type: unfeaturizedactions:  - action_aaa  - action_ask_email  - validate_open_incident_form  - validate_incident_status_formforms:  open_incident_form:    email:      - type: from_entity        entity: email      - type: from_intent        intent: affirm        value: true      - type: from_intent        intent: deny        value: false    priority:      - type: from_entity        entity: priority    problem_description:      - type: from_text        not_intent:          - incident_status          - bot_challenge          - help          - affirm          - deny    incident_title:      - type: from_trigger_intent        intent: password_reset        value: Problem resetting password      - type: from_trigger_intent        intent: problem_email        value: Problem with email      - type: from_text        not_intent:          - incident_status          - bot_challenge          - help          - affirm          - deny    confirm:      - type: from_intent        intent: affirm        value: true      - type: from_intent        intent: deny        value: false  incident_status_form:    email:      - type: from_entity        entity: email      - type: from_intent        intent: affirm        value: true      - type: from_intent        intent: deny        value: false';


describe('Importing a Botfront project', function() {
    beforeEach(function() {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'fr');
        cy.login();
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });
    it('should process a file', function() {
        cy.visit('/project/bf/settings/import-export');
        cy.fixture('domain.yml', 'utf-8').then((rawText) => {
            cy.dataCy('drop-zone-data').uploadTxt(rawText, 'domain.yml');
        });

        cy.dataCy('label').should('have.class', 'yellow');
        cy.dataCy('message-warning-domainyml').should('have.text', 'domain.yml'
        + 'those reponses will add the support for the language en :utter_cgMeFnuj5, utter_J5MMvow26'
        + 'those reponses will add the support for the language ru :utter_uCag8LL6z'
        + 'Some actions in domain are not explicitly mentioned in dialogue fragments.'
        + 'They will be added to the project\'s default domain.');
        cy.dataCy('summary-list').should('have.text', 'Support for language \'en\' will be added using the default config.'
        + 'Support for language \'ru\' will be added using the default config.'
        + '3 responses, 1 actions will be added from domain.yml.');
    });
    it('Should mark as error a file that is not json/yaml/zip/yml/md', function() {
        cy.visit('/project/bf/settings/import-export');
        cy.fixture('dummyBadFile.png').then((badfile) => {
            cy.dataCy('drop-zone-data').uploadBlob(badfile, 'dummyBadFile.png');
        });

        cy.dataCy('label').should('have.class', 'red');
        cy.dataCy('message-error-dummyBadFilepng').should('have.text', 'dummyBadFile.pngFile is not .zip, .json, .md or .yaml.');
    });

    it('should import a zip', function() {
        cy.visit('/project/bf/settings/import-export');
        cy.task('zipFolder', 'test-project-cypress').then(async (b64zip) => {
            const blob = await Cypress.Blob.base64StringToBlob(b64zip, 'application/zip');
            cy.dataCy('drop-zone-data').uploadBlob(blob, 'testProject.zip');
            cy.get('.message.red').should('have.length', 2);
            cy.get('.message.yellow').should('have.length', 7);

            // check Errors
            cy.dataCy('message-error-endpointsbfyml').should('have.text', 'endpointsbf.yml'
        + 'Unknown file type');
            // we use contain here because I'm having issue with the behavior of have text and escape charaters
            cy.dataCy('message-error-credentialsdevyml').should('contain.text', 'credentials.dev.yml'
        + 'Not valid yaml: bad indentation of a mapping entry at line 3, column 20');
        
            // check warnings
            cy.dataCy('message-warning-config-ruyml').should('have.text', 'config-ru.yml'
        + 'Dropped policies, since policies are already found in file config-en.yml.');
            cy.dataCy('message-warning-domain-bfyml').should('have.text', 'domain-bf.yml'
        + 'Some actions in domain are not explicitly mentioned in dialogue fragments.'
        + 'They will be added to the project\'s default domain.');
            cy.dataCy('message-warning-default-domainyml').should('have.text', 'default-domain.yml'
        + 'You have multiple domain files. In case of a conflict, data from first file will prevail.');
            cy.dataCy('message-warning-domainyml').should('have.text', 'domain.yml'
        + 'Some actions in domain are not explicitly mentioned in dialogue fragments.'
        + 'They will be added to the project\'s default domain.'
        + 'You have multiple domain files. In case of a conflict, data from first file will prevail.');
            cy.dataCy('message-warning-endpointsdevyml').should('have.text', 'endpoints.dev.yml'
        + 'The "dev" environment is not supported by this project, this file won\'t be used in the import');
            cy.dataCy('message-warning-nlu-multilangyml').should('have.text', 'nlu-multilang.yml'
        + 'File contains data for German; a new model will be created for that language.');
            cy.dataCy('message-warning-test_ko_storiesyml').should('have.text', 'test_ko_stories.yml'
        + '1 test will not be added as Korean is not a project language:korean test case');

       
            // check Summary
            cy.dataCy('summary-list')
                .should('contain.text', 'The default domain will be replaced by default-domain-bf.yml, default-domain.yml')
                .should('contain.text', 'Pipeline for new language model \'ru\' will be imported from config-ru.yml.')
                .should('contain.text', 'Policies will be overwritten by config-en.yml.')
                .should('contain.text', 'Pipeline for new language model \'en\' will be imported from config-en.yml.')
                .should('contain.text', 'Botfront config will be imported from bfconfig.yml.')
                .should('contain.text', '134 NLU data will be imported to French model.')
                .should('contain.text', '133 examples, 1 synonym will be imported.')
                .should('contain.text', 'Group \'rules.yml\' will be created with 9 rules.')
                .should('contain.text', 'Group \'handoff.yml\' will be created with 3 stories.Group \'stories.yml\' will be created with 9 stories.')
                .should('contain.text', 'Endpoints will be imported from endpoints.yml.')
                .should('contain.text', 'Credentials will be imported from credentials.yml.')
                .should('contain.text', '10 slots, 23 responses, 2 forms, 4 actions will be added from domain-bf.yml, domain.yml')
                .should('contain.text', 'A new model with default pipeline will be created for German.')
                .should('contain.text', 'You will add 8 conversations')
                .should('contain.text', 'You will add 4 incoming')
                .should('contain.text', '1 NLU data will be imported to German model.')
                .should('contain.text', '1 NLU data will be imported to Russian model.')
                .should('contain.text', '1 NLU data will be imported to English model.');


            cy.dataCy('import-files').click();
            cy.get('.yellow.message').should('not.exist');
            cy.get('.red.message').should('not.exist');
            cy.get('.info.message').should('not.exist');
            cy.get('.file-label').should('not.exist');
            cy.visit('/project/bf/settings/endpoints');
            cy.get('.ace_content').should('have.text', resultingEndpoints);
            cy.visit('/project/bf/settings/credentials');
            cy.get('.ace_content').should('have.text', resultingCredentials);
            cy.visit('/project/bf/settings/default-domain');
     
            cy.get('.ace_content').should('have.text', resultingDefaultDomain);
            cy.visit('/project/bf/settings/info');
            cy.get('.blue.label').should('contain.text', 'French');
            cy.get('.blue.label').should('contain.text', 'English');
            cy.get('.blue.label').should('contain.text', 'Russian');
            cy.get('.blue.label').should('contain.text', 'German');

            cy.visit('/project/bf/responses');
  
       
            cy.get('.select-wrap select').select('25');
            cy.dataCy('template-intent').should('have.length', 23);

            cy.get('.item').contains('German').click();
            cy.get('.select-wrap select').select('25');
            cy.dataCy('response-text').should('contains.text', 'Hallo !');
            cy.get('.item').contains('French').click();
            cy.get('.select-wrap select').select('25');
            // french was set as the fallback lang so those response are not in french it's normal
            cy.dataCy('response-text').should('contains.text', 'Goodbye!');
            cy.dataCy('response-text').should('contains.text', 'this incident?');
            cy.get('.item').contains('Russian').click();
            cy.get('.select-wrap select').select('25');
            cy.dataCy('response-text').should('contains.text', 'алло');
            cy.get('.item').contains('English').click();
            cy.get('.select-wrap select').select('25');
            cy.dataCy('response-text').should('contains.text', 'bye');
        
      
            cy.visit('/project/bf/nlu/model/en');
            // the default language should have changed to english, if it's not the case the user will be redirected to another language
            cy.dataCy('language-selector').find('div.text').should('have.text', 'English');
            cy.get('.row').should('have.length', 1);
            cy.get('.row').should('have.text', 'greethi');
            cy.dataCy('nlu-menu-settings').click();
            cy.get('.ace_content').should('contain.text', '- name: TestDummyLineEn');

       
            cy.dataCy('language-selector').click().find('div').contains('French')
                .click();
            cy.dataCy('nlu-menu-training-data').click();
            cy.get('.row').should('have.length', 19);
            cy.dataCy('nlu-menu-settings').click();
            // CRFEntityExtractor  is only used in the lite pipeline so check it's presence ensure that the pipeline is the same as when it was created
            cy.get('.ace_content .ace_text-layer').should('contain.text', '- name: CRFEntityExtractor');
     
            cy.dataCy('language-selector').click().find('div').contains('Russian')
                .click();
            cy.dataCy('nlu-menu-training-data').click();
            cy.get('.row').should('have.length', 1);
            cy.dataCy('nlu-menu-settings').click();
            cy.get('.ace_content').should('contain.text', '- name: TestDummyLineRu');
            cy.dataCy('language-selector').click().find('div').contains('German')
                .click();
            cy.dataCy('nlu-menu-training-data').click();
            cy.get('.row').should('have.length', 1);
            cy.dataCy('nlu-menu-settings').click();
            // Gazette  is only used in defaultpipeline lite pipeline so checking it's presence ensure that the pipeline is from default
            cy.get('.ace_content').should('contain.text', 'rasa_addons.nlu.components.gazette.Gazette');

            cy.visit('/project/bf/dialogue');
            cy.dataCy('story-group-menu-item').should('contains.text', 'handoff.yml');
            cy.dataCy('story-group-menu-item').should('contains.text', 'rules.yml');
            cy.dataCy('story-group-menu-item').should('contains.text', 'stories.yml');
            cy.dataCy('story-group-menu-item').should('contains.text', 'Example group');
            cy.dataCy('story-group-menu-item').should('contains.text', 'test cases');
            cy.dataCy('story-group-menu-item').should('have.length', 30);

            cy.dataCy('slots-modal').click();
            cy.dataCy('slot-editor').should('have.length', 10);
            cy.get('.dimmer').click({ force: true });

            cy.dataCy('policies-modal').click();
            cy.get('.ace_content').should('contain.text', '- name: AugmentedMemoizationPolicyEn');
            cy.get('.dimmer').click({ force: true });

            cy.visit('/project/bf/incoming/newutterances');
            cy.get('.row').should('have.length', 4);
            cy.dataCy('conversations').click();
            cy.dataCy('conversation-item').should('have.length', 8);
        });
    });
    it('should import a file with wipe project', function() {
        cy.visit('/project/bf/settings/import-export');
        cy.task('zipFolder', 'test-project-cypress').then(async (b64zip) => {
        // import a project so there is something to wipe
            const blob = await Cypress.Blob.base64StringToBlob(b64zip, 'application/zip');
            cy.dataCy('drop-zone-data').uploadBlob(blob, 'testProject.zip');
       
            cy.get('.info.message').should('exist');
            cy.dataCy('import-files').click();
            cy.get('.info.message').should('not.exist');

      
            // this file only has one incoming, beside this one everything should be empty/default
            // so this data is just a kind of dummy to test the wiping of projects
            cy.fixture('incoming.json', 'utf-8').then((rawText) => {
                cy.dataCy('drop-zone-data').upload(rawText, 'incoming.json');
            });
            cy.dataCy('wipe-project').click();
            cy.get('.info.message').should('exist');
            cy.dataCy('import-files').click();
            cy.get('.info.message').should('not.exist');
            cy.visit('/project/bf/dialogue');
            // this check is to ensure that the page rendered correctly
            cy.dataCy('add-item').should('exist');

            cy.dataCy('story-group-menu-item').should('have.length', 0);
            cy.visit('/project/bf/incoming/newutterances');
            cy.get('.row').should('have.length', 1);
            cy.dataCy('conversations').click();
            cy.dataCy('conversation-item').should('have.length', 0);
      
            cy.visit('/project/bf/settings/endpoints');
            cy.get('.ace_content').should('contain.text', 'rasa_addons.core.tracker_stores.botfront.BotfrontTrackerStore');
            cy.visit('/project/bf/settings/credentials');
            cy.get('.ace_content').should('contain.text', 'rasa_addons.core.channels.webchat.WebchatInput');
     
            cy.visit('/project/bf/settings/default-domain');
            cy.get('.ace_content').should('contain.text', 'actions:  - action_botfront_disambiguation  - action_botfront_disambiguation_followup  - action_botfront_fallback  - action_botfront_mapping');
            cy.visit('/project/bf/responses');
            cy.dataCy('no-responses').should('exist');
            cy.visit('/project/bf/nlu/model/fr');
            cy.dataCy('example-text-editor-input').should('exist');
            cy.get('.row').should('not.exist');
        });
    });
});
