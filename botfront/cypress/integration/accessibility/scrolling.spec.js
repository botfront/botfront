/* eslint-disable no-undef */

const modelName = 'aModel';
const modelLang = 'fr';
let modelId = '';

describe('Bot responses', function() {
    beforeEach(function () {
        cy.login();
    });

    afterEach(function () {
        cy.logout();
    });

    before(function() {
        cy.login();
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.get('@bf_project_id').then((id) => {
            cy.createNLUModelProgramatically(id, modelName, modelLang, 'my description')
                .then((result) => {
                    modelId = result;
                });
        });
    });

    after(function() {
        cy.login();
        cy.deleteNLUModelProgramatically(modelId, this.bf_project_id);
        cy.logout();
    });

    it('Should scroll into training data', function() {
        cy.visit(`/project/${this.bf_project_id}/nlu/model/${modelId}`);
        cy.contains('Training Data').click();
        cy.contains('Chit Chat').click();
        cy.get('[role=combobox]').eq(1).click();
        cy.get('[role=listbox].menu').contains('basics.yes').click();
        cy.get('[role=listbox].menu').contains('basics.time').click();
        cy.get('[role=listbox].menu').contains('basics.no').click();
        cy.get('[data-cy=chit-chat-message]').click();
        cy.get('[data-cy=add-chit-chat]').click();
        cy.contains('OK').click();
        cy.contains('Examples').click();

        cy.get('[data-cy=left-pane]').scrollTo(0, 0);
        cy.get('[data-cy=left-pane]').then(($node) => {
            expect($node[0].scrollTop).to.equal(0);
        });
        cy.get('[data-cy=left-pane]').scrollTo(0, 500);
        cy.get('[data-cy=left-pane]').then(($node) => {
            expect($node[0].scrollTop).to.equal(500);
        });
    });

    it('Should scroll the bot responses', function() {
        cy.visit(`/project/${this.bf_project_id}/dialogue/templates`);
        for (let i = 0; i < 20; i++) {
            cy.createResponseFast(this.bf_project_id, `utter_response${i}`);
        }
        cy.wait(3000);
        cy.get('[data-cy=left-pane]').scrollTo(0, 0);
        cy.get('[data-cy=left-pane]').then(($node) => {
            expect($node[0].scrollTop).to.equal(0);
        });
        cy.get('[data-cy=left-pane]').scrollTo(0, 300);
        cy.get('[data-cy=left-pane]').then(($node) => {
            expect($node[0].scrollTop).to.equal(300);
        });
        for (let i = 0; i < 20; i++) {
            cy.deleteResponseFast(this.bf_project_id, `utter_response${i}`);
        }
    });
});
