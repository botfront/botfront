/* global cy:true */
describe('training data import', function() {
    beforeEach(function() {
        cy.login();
    });

    before(function() {
        cy.createProject('bf', 'My Project', 'fr');
    });

    after(function() {
        cy.deleteProject('bf');
    });

    it('should import training data', function() {
        cy.visit('/project/bf/settings');
        cy.dataCy('project-settings-menu-import-export').click();
        cy.fixture('nlu_import.json', 'utf8').then((content) => {
            cy.dataCy('drop-zone-nlu-data').upload(content, 'data.json');
        });
        cy.wait(1000);
        cy.dataCy('import-rasa-files').click({ force: true });

        cy.visit('/project/bf/nlu/models');
        cy.contains('Training Data').click();
        cy.contains('Statistics').click();
        cy.contains('943')
            .siblings('.label')
            .should('contain', 'Examples');
        cy.contains('Intents')
            .siblings('.value')
            .should('contain', '56');
        cy.contains('Entities')
            .siblings('.value')
            .should('contain', '3');
    });
});
