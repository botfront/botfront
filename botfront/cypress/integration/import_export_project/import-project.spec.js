/* global Cypress cy: true */
import { resultingEndpoints, resultingDefaultDomain, resultingCredentials } from './import-project.data';

// eslint-disable-next-line max-len


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
    // it('should process a file', function() {
    //     cy.visit('/project/bf/settings/import-export');
    //     cy.fixture('domain.yml', 'utf-8').then((rawText) => {
    //         cy.dataCy('drop-zone-data').uploadTxt(rawText, 'domain.yml');
    //     });

    //     cy.dataCy('label').should('have.class', 'yellow');
    //     cy.dataCy('message-warning-domainyml').should('have.text', 'domain.ymlthose reponses will add the support for the language en :utter_cgMeFnuj5, utter_J5MMvow26those reponses will add the support for the language ru :utter_uCag8LL6zSome actions defined in this file will be added to the default domain on importthe actions that will be added to the default domain are the one that are in this file and not used directly by the rules or stories');
    //     cy.dataCy('message-summary').should('have.text', 'Import summaryFrom domain.yml you will add: 3 responses, 1 actions (actions ends up in the default domain)Support for the lang \'en\' will be added using the default configSupport for the lang \'ru\' will be added using the default configImport');
    // });
    // it('Should mark as error a file that is not json/yaml/zip/yml/md', function() {
    //     cy.visit('/project/bf/settings/import-export');
    //     cy.fixture('dummyBadFile.png').then((badfile) => {
    //         cy.dataCy('drop-zone-data').uploadBlob(badfile, 'dummyBadFile.png');
    //     });

    //     cy.dataCy('label').should('have.class', 'red');
    //     cy.dataCy('message-error-dummyBadFilepng').should('have.text', 'dummyBadFile.pngFile is not .zip, .json, .md or .yaml.');
    // });

    it('should import a zip', function() {
        cy.visit('/project/bf/settings/import-export');
        cy.fixture('testProject.zip').then((b64data) => {
            const blob = Cypress.Blob.base64StringToBlob(b64data, 'application/zip');
            cy.dataCy('drop-zone-data').uploadBlob(blob, 'testProject.zip');
        });

        // check Errors
        cy.dataCy('message-error-endpoints-bfyml').should('have.text', 'endpoints-bf.yml'
        + 'Unknown file type');
        // we use contain here because I'm having issue with the behavior of have text and escape charaters
        cy.dataCy('message-error-credentialsdevyml').should('contain.text', 'credentials.dev.yml'
        + 'Not valid yaml: bad indentation of a mapping entry at line 3, column 20');
        
        // check warnings
        cy.dataCy('message-warning-config-enyml').should('have.text', 'config-en.yml'
        + 'Dropped policies, since policies are already found in file config-ru.yml.');
        cy.dataCy('message-warning-domain-bfyml').should('have.text', 'domain-bf.yml'
        + 'those reponses will add the support for the language de :utter_greet'
        + 'Some actions defined in this file will be added to the default domain on import'
        + 'the actions that will be added to the default domain are the one that are in this file and not used directly by the rules or stories');
        cy.dataCy('message-warning-default-domain-bfyml').should('have.text', 'default-domain-bf.yml'
        + 'You have multiple default domain files. if some data conflicts, the one from the first file with that data will be used (same way has rasa merges domains)');
        cy.dataCy('message-warning-domainyml').should('have.text', 'domain.yml'
        + 'forms defined in this file will be added to the default domain on import'
        + 'Some actions defined in this file will be added to the default domain on import'
        + 'the actions that will be added to the default domain are the one that are in this file and not used directly by the rules or stories'
        + 'You have multiple domain files. if some data conflicts, the one from the first file with that data will be used (same way has rasa merges domains)');
        cy.dataCy('message-warning-endpointsdevyml').should('have.text', 'endpoints.dev.yml'
        + 'Conflicts with endpoints.yml, and thus won\'t be used in the import');
        // check Summary
        cy.dataCy('message-summary')
            .should('contain.text', 'The default domain will be replaced by default-domain.yml, default-domain-bf.yml')
            .should('contain.text', 'Pipeline for new language model \'ru\' will be imported from config-ru.yml.')
            .should('contain.text', 'Policies will be overwritten by config-ru.yml.Pipeline for new language model \'en\' will be imported from config-en.yml.')
            .should('contain.text', 'Botfront config will be imported from bfconfig.yml.133 NLU data will be imported to French model.')
            .should('contain.text', '132 examples, 1 synonym will be imported.Group \'rules.yml\' will be created with 9 rules.')
            .should('contain.text', 'Group \'handoff.yml\' will be created with 3 stories.Group \'stories.yml\' will be created with 9 stories.')
            .should('contain.text', 'Endpoints will be imported from endpoints.yml.')
            .should('contain.text', 'Credentials will be imported from credentials.yml.')
            .should('contain.text', 'From domain-bf.yml, domain.yml you will add: 10 slots, 23 responses, 2 forms, 4 actions (actions ends up in the default domain)')
            .should('contain.text', 'Support for the lang \'de\' will be added using the default config')
            .should('contain.text', 'Import');

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
        
        cy.visit('/project/bf/dialogue');
        cy.dataCy('story-group-menu-item').should('contains.text', 'handoff.yml');
        cy.dataCy('story-group-menu-item').should('contains.text', 'rules.yml');
        cy.dataCy('story-group-menu-item').should('contains.text', 'stories.yml');
        cy.dataCy('story-group-menu-item').should('contains.text', 'Example group');

        cy.dataCy('story-group-menu-item').should('have.length', 28);
        // cy.visit('/project/bf/nlu/model/en');
        // cy.get('.row').should('have.length', 4);
        // cy.dataCy('nlu-menu-settings').click();
        // cy.get('.ace_content').should('have.text', 'ah');
    });
    // it('should import a zip with wipe project', function() {
    //     cy.visit('/project/bf/settings/import-export');
    //     cy.fixture('My_Project_2020-11-02T16_26_05.278Z.zip').then((b64data) => {
    //         const blob = Cypress.Blob.base64StringToBlob(b64data, 'application/zip');
    //         cy.dataCy('drop-zone-data').uploadBlob(blob, 'domain.yml');
    //     });
    //     cy.wait(10000);
    // });
});
