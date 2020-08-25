/* global cy */

const responses = [{
    key: 'utter_go_go',
    values: [{ sequence: [{ content: 'text: GO GO GO' }], lang: 'en' }],
}];

describe('responses:r restricted permissions', () => {
    before(() => {
        cy.removeDummyRoleAndUser();
        cy.createProject('bf', 'My Project', 'en');
        cy.addResponses('bf', responses);
        cy.createDummyRoleAndUser({ permission: ['responses:r'] });
        cy.wait(2000);
        cy.logout();
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

    it('should not show edit features in responses', () => {
        cy.visit('/project/bf/responses');
        cy.dataCy('response-text').should('contain', 'GO GO GO');
        cy.dataCy('remove-response-0').should('not.exist');
        cy.dataCy('create-response').should('not.exist');
        cy.dataCy('edit-response-0').click();
        cy.dataCy('response-name-input').parent().should('have.class', 'read-only');
        cy.dataCy('variation-container').should('have.class', 'read-only');
        cy.dataCy('icon-trash').should('not.exist');
        cy.dataCy('metadata-tab').click();
        cy.get('.required.field').should('have.class', 'disabled');
    });
});
