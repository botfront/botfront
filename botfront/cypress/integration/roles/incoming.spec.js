/* global cy */

describe('incoming:r restricted permissions', () => {
    before(() => {
        cy.createProject('bf', 'My Project', 'en');
        cy.login();
        cy.setTimezoneOffset();
        cy.addConversationFromTemplate('bf', 'default', 'dev1', { language: 'en' });
        cy.createDummyRoleAndUser({ permission: ['incoming:r'] });
    });

    beforeEach(() => {
        cy.login({ admin: false });
    });
    afterEach(() => {
        cy.logout();
    });


    after(() => {
        cy.deleteProject('bf');
        cy.removeDummyRoleAndUser();
    });

    it('should not show the delete and move buttons in activity', () => {
        cy.visit('/project/bf/incoming/');
        cy.dataCy('intent-label').should('exist').should('have.class', 'uneditable');
        cy.dataCy('icon-sign-out').should('not.exist');
        cy.dataCy('trash').should('not.exist');
    });

    it('should not show the delete conversation button', () => {
        cy.visit('/project/bf/incoming/');
        cy.dataCy('conversations').click();
        cy.dataCy('conversation-item').should('exist');
        cy.dataCy('conversation-delete').should('not.exist');
    });

    it('should not show populate tab', () => {
        cy.visit('/project/bf/incoming/');
        cy.dataCy('populate').should('not.exist');
    });
});
