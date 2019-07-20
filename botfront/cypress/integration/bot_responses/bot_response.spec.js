/* eslint-disable no-undef */

const responseName = 'utter_abcdef';
const templateFormats = [
    { menu: 'Text', label: 'Text' },
    { menu: 'Text with buttons', label: 'Quick Replies' },
    { menu: 'Image', label: 'Image' },
    { menu: 'Button template', label: 'Button template' },
    { menu: 'List template', label: 'List template' },
    { menu: 'Generic template', label: 'Generic template' },
    { menu: 'Messenger Handoff', label: 'Messenger Handoff' },
];

describe('Bot responses', function() {
    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
    });

    before(function() {
        cy.createProject('bf', 'My Project', 'fr')
            .then(() => cy.createNLUModelProgramatically('bf', '', 'de'));
    });

    after(function() {
        cy.deleteProject('bf');
    });

    it('Should create a bot response', function() {
        cy.visit('/project/bf/dialogue/templates/add');
        cy.contains('German').click();
        cy.get('[data-cy=response-name] input').type(responseName);

        templateFormats.forEach((format, index) => {
            cy.get('.response-message-next > .big > .ui').click();
            // cy.get('.response-message-next > .sequence-add-message-menu-header').should('be.visible');
            cy.get('.response-message-next.sequence-add-message')
                .contains(format.menu)
                .click();
            cy.get(`.response-message-${index} .ace_content`).should('be.visible');
        });

        templateFormats.forEach((format, index) => {
            cy.get(`.response-message-${index} .ace_content`);
            cy.get(`.response-message-${index} .message-format-confirm`);
            cy.get(`.response-message-${index} .message-format-confirm`)
                .invoke('text')
                .should('contain', format.label);
        });

        cy.get('.response-save-button').click();
        cy.url().should('be', '/project/bf/dialogue/templates');
    });

    it('Bot response should be the same when re-opened', function() {
        cy.openResponse('bf', responseName);
        cy.contains('German').click();
        templateFormats.forEach((format, index) => {
            cy.get(`.response-message-${index} .ace_content`);
            cy.get(`.response-message-${index} .message-format-confirm`);
            cy.get(`.response-message-${index} .message-format-confirm`)
                .invoke('text')
                .should('contain', format.label);
        });
    });

    it('should rename a bot response', function() {
        cy.openResponse('bf', responseName);
        cy.contains('German').click();
        cy.get('input')
            .first()
            .type(`{selectall}{del}${responseName}aaa`);
        cy.get('.response-save-button').click();
        cy.openResponse('bf', `${responseName}aaa`);
        cy.get('input')
            .first()
            .should('have.attr', 'value', `${responseName}aaa`);
        cy.get('input')
            .first()
            .type(`{selectall}{del}${responseName}`);
        cy.get('.response-save-button').click();
    });

    it('should not create a response with the same name', function() {
        cy.visit('/project/bf/dialogue/templates/add');
        cy.contains('German').click();
        cy.get('[data-cy=response-name] input').type(responseName);
        cy.get('.response-save-button').click();
        cy.get('.s-alert-error');
        cy.url().should('be', '/project/bf/dialogue/templates/add');
    });

    it('Message can be inserted', function() {
        cy.openResponse('bf', responseName);
        cy.contains('German').click();
        cy.get('.response-message-2.sequence-add-message').click();
        cy.get('.response-message-2.sequence-add-message')
            .contains('Button template')
            .click();
        cy.get('.response-message-2 .ace_content');
        cy.get('.response-message-2 .message-format-confirm');
        cy.get('.response-message-2 .message-format-confirm')
            .invoke('text')
            .should('contain', 'Button template');
        // Save and re-open
        cy.get('.response-save-button').click();
        cy.openResponse('bf', responseName);
        cy.contains('German').click();
        // Verify the insertion was persisted
        cy.get('.response-message-2 .ace_content');
        cy.get('.response-message-2 .message-format-confirm');
        cy.get('.response-message-2 .message-format-confirm');
    });

    it('Should delete a bot response', function() {
        cy.deleteResponse('bf', responseName);
        cy.get('[data-cy=remove-response-0]').should('not.be.visible');
    });
});
