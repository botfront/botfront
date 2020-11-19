/* global Cypress cy: true */

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
    //     cy.dataCy('message-warning').should('have.text', 'domain.ymlthose reponses will add the support for the language en :utter_cgMeFnuj5, utter_J5MMvow26those reponses will add the support for the language ru :utter_uCag8LL6z');
    // });
    // it('Should mark as error a file that is not json/yaml/zip/yml/md', function() {
    //     cy.visit('/project/bf/settings/import-export');
    //     cy.fixture('dummyBadFile.jpg', 'utf-8').then((rawText) => {
    //         cy.dataCy('drop-zone-data').uploadTxt(rawText, 'dummyBadFile.jpg');
    //     });

    //     cy.dataCy('label').should('have.class', 'red');
    //     cy.dataCy('message-error').should('have.text', 'domain.ymlthose reponses will add the support for the language en :utter_cgMeFnuj5, utter_J5MMvow26those reponses will add the support for the language ru :utter_uCag8LL6z');
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
            .should('contain.text', 'From domain-bf.yml, domain.yml you will add: 10 slots, 23 responses, 2 forms, 4 actions to the default domain')
            .should('contain.text', 'Support for the lang \'de\' will be added using the default config')
            .should('contain.text', 'Import');
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
