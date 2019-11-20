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
        cy.visit('/project/bf/nlu/models');
        cy.get('.nlu-menu-settings').click();
        cy.contains('Import').click();
        cy.fixture('nlu_import.json', 'utf8').then((content) => {
            cy.get('.file-dropzone').upload(content, 'data.json');
        });

        cy.contains('Import Training Data').click();
        cy.get('.s-alert-success').should('be.visible');
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
