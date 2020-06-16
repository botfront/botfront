/* global cy */

describe('nlu-data:r restricted permissions', () => {
    before(() => {
        cy.removeDummyRoleAndUser();
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en');
        cy.importNluData('bf', 'nlu_sample_en.json', 'en', false, ['Let\'s get started!']);
        cy.createDummyRoleAndUser({ permission: ['nlu-data:r'] });
    });

    beforeEach(() => {
        cy.login({ admin: false });
    });
    afterEach(() => {
        cy.logout();
    });

    after(() => {
        cy.logout();
        cy.deleteProject('bf');
        cy.removeDummyRoleAndUser();
    });

    it('should not show forbidden sections', () => {
        cy.visit('/');
        cy.get('.ui.pointing.secondary.menu').should('exist')
            .should('contain', 'Examples')
            .should('not.contain', 'Chit Chat')
            .should('not.contain', 'Insert Many');
        cy.dataCy('nlu-menu-evaluation').should('not.exist');
        cy.dataCy('nlu-menu-settings').click();
        cy.get('.ace_editor')
            .find('textarea').click({ force: true })
            .type('TYPING BUT FAILING', { force: true });
        cy.get('.ace_editor')
            .should('contain.text', '- name:')
            .should('not.contain.text', 'TYPING BUT FAILING');
        cy.dataCy('save-button').should('not.exist');
        cy.get('.ui.pointing.secondary.menu').should('exist')
            .should('not.contain', 'Delete');
    });

    it('should not show nlu example editor in playground or train button', () => {
        cy.visit('/');
        cy.dataCy('example-text-editor-input').should('exist').click()
            .type('hello');
        cy.dataCy('nlu-example-tester').should('exist').click();
        cy.get('.ui.purple.pointing.label').should('not.exist'); // editor didn't open
        cy.dataCy('train-button').should('not.exist'); // train button doesn't exist
    });

    it('should not show edit features in examples, synonyms, gazettes', () => {
        cy.visit('/');
        cy.dataCy('intent-label').should('exist').should('have.class', 'uneditable');
        cy.dataCy('icon-trash').should('not.exist');
        cy.dataCy('utterance-text').first().trigger('mouseover');
        cy.dataCy('icon-edit').should('not.exist');
        cy.dataCy('icon-gem').should('exist').should('have.class', 'disabled');
        cy.get('.ui.pointing.secondary.menu').contains('Synonyms').click();
        cy.get('.ReactTable').should('exist').should('contain', 'doodad');
        cy.dataCy('trash').should('not.exist');
        cy.get('.ui.pointing.secondary.menu').contains('Gazette').click();
        cy.get('.ReactTable').should('exist').should('contain', 'color');
        cy.dataCy('trash').should('not.exist');
    });
});
