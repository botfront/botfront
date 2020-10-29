/* global cy:true */

describe('Project Core Policy', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login());
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    describe('Core Policy', function() {
        it('Can be saved', function() {
            cy.visit('/project/bf/dialogue');
            cy.dataCy('policies-modal').click();
            cy.dataCy('core-policies-yaml')
                .find('textarea')
                .focus()
                .type(' # test', { force: true });
            cy.dataCy('augmentation-factor').find('input').click();
            cy.dataCy('augmentation-factor').find('input').type('1234');
            cy.get('[data-cy=save-button]').click();
            cy.get('[data-cy=changes-saved]').should('be.visible');
            cy.reload();
            cy.dataCy('policies-modal').click();
            cy.dataCy('augmentation-factor').find('input').should('have.value', '1234');
            cy.dataCy('core-policies-yaml').should('include.text', '# test');
        });
    });
});
