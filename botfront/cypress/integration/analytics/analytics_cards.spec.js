/* global cy */

describe('analytics cards', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('should not show the export button when no data is loaded', function() {
        cy.visit('/project/bf/analytics');
        cy.dataCy('no-data-message').should('exist');
        cy.dataCy('analytics-export-button')
            .should('not.exist');
    });

    it('should persist analytics cards settings', () => {
        cy.visit('/project/bf/analytics');
        cy.dataCy('table-chart-button').eq(0).should('not.have.class', 'selected');
        cy.dataCy('table-chart-button').eq(0).click();
        cy.dataCy('table-chart-button').eq(0).should('have.class', 'selected');
        cy.visit('/project/bf/analytics');
        cy.dataCy('table-chart-button').eq(0).should('have.class', 'selected');
    });

    it('should add a new card, rename it and delete it', () => {
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 7);
        cy.dataCy('create-card').click();
        cy.dataCy('create-card').find('div.item').eq(0).click();
        cy.dataCy('analytics-card').should('have.length', 8);
        cy.dataCy('analytics-card').first().find('.title').dblclick();
        cy.dataCy('analytics-card').first().find('input')
            .type('{selectAll}{backSpace}New card{enter}', { force: true });
        cy.dataCy('analytics-card').first().find('.title').should('contain.text', 'New card');
        cy.dataCy('analytics-card').first().dragTo('delete-card-dropzone');
        cy.dataCy('analytics-card').should('have.length', 7);
    });

    it('should change a single card\'s or every card\'s date range', () => {
        cy.visit('/project/bf/analytics');
        cy.dataCy('analytics-card').should('have.length', 7);
        cy.pickDateRange(0, '30/3/2020', '31/3/2020', false);
        cy.dataCy('date-picker-container', '30/03/2020 - 31/03/2020').should('have.length', 1);
        cy.pickDateRange(0, '30/3/2020', '31/3/2020', true);
        cy.dataCy('date-picker-container', '30/03/2020 - 31/03/2020').should('have.length', 7);
    });
});
