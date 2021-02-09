/* global cy expect */

describe('Project Settings', function () {
    beforeEach(function () {
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login());
    });

    afterEach(function () {
        cy.logout();
        cy.deleteProject('bf');
    });

    describe('Project info', function () {
        it('A project can be renamed', function () {
            cy.visit('/project/bf/settings');
            cy.dataCy('project-name').find('input').type('33');
            cy.dataCy('save-changes').click();
            cy.dataCy('project-name').find('input')
                .should('have.value', 'My Project33');

            // reload page to verify info is still correct
            cy.visit('/project/bf/settings/info');
            cy.dataCy('project-name').find('input')
                .should('have.value', 'My Project33')
                // Switching back
                .type('{backspace}{backspace}');
            cy.dataCy('save-changes').click();
            cy.get('.s-alert-success').should('be.visible');
            cy.dataCy('project-name').find('input')
                .should('have.value', 'My Project');
        });

        it('Default language can be set', function () {
            cy.visit('/project/bf/settings');
            cy.get('.project-default-language .ui > .search').click();
            cy.get('.project-default-language input').type('English');
            cy.get('.project-default-language')
                .contains('English')
                .click({ force: true });
            cy.get('.save-project-info-button').click();
            cy.get('.project-default-language > .ui > div.text').should(($div) => {
                expect($div.first()).to.contain('English');
            });

            // reload page to verify info is still correct
            cy.visit('/project/bf/settings/info');
            cy.get('.project-default-language > .ui > div.text').should(($div) => {
                expect($div.first()).to.contain('English');
            });
        });

        it('NLU threshold can be set', function () {
            cy.visit('/project/bf/settings');
            cy.get('[data-cy=change-nlu-threshold] input').click().type('{backspace}{backspace}{backspace}{backspace}0.56');
            cy.get('[data-cy=save-changes]').click();
            cy.get('[data-cy=change-nlu-threshold] input').should('have.value', '0.56');

            cy.visit('/project/bf/settings/info');
            cy.get('[data-cy=change-nlu-threshold] input').should('have.value', '0.56');

            cy.get('[data-cy=change-nlu-threshold] input').click().type('{backspace}{backspace}{backspace}{backspace}0.85');
            cy.get('[data-cy=save-changes]').click();
            cy.get('[data-cy=change-nlu-threshold] input').should('have.value', '0.85');
        });

        it('Time zone offset can be set', function () {
            cy.visit('/project/bf/settings');
            cy.get('[data-cy=change-timezone-offset] input').click().type('{backspace}{backspace}{backspace}{backspace}2');
            cy.get('[data-cy=save-changes]').click();
            cy.get('[data-cy=change-timezone-offset] input').should('have.value', '2');

            cy.visit('/project/bf/settings/info');
            cy.get('[data-cy=change-timezone-offset] input').should('have.value', '2');

            cy.get('[data-cy=change-timezone-offset] input').click().type('{backspace}{backspace}{backspace}{backspace}-3');
            cy.get('[data-cy=save-changes]').click();
            cy.get('[data-cy=change-timezone-offset] input').should('have.value', '-3');
        });
    });
});
