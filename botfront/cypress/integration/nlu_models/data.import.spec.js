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
        cy.visit('/project/bf/settings/import-export');
        cy.fixture('nlu_import.json', 'utf8').then((content) => {
            cy.dataCy('drop-zone-nlu-data').upload(content, 'data.json');
        });
        cy.wait(1000);
        cy.dataCy('import-rasa-files').click({ force: true });

        cy.visit('/project/bf/nlu/models');
        cy.contains('Training Data').click();
        cy.contains('Statistics').click();
        cy.get('.glow-box').contains('Examples')
            .siblings('.value')
            .should('contain', '4');
        cy.get('.glow-box').contains('Intents')
            .siblings('.value')
            .should('contain', '2');
        cy.get('.glow-box').contains('Entities')
            .siblings('.value')
            .should('contain', '1');
    });
});
