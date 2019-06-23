// /* eslint-disable no-undef */

// const intentName = 'QQQQ';
// const dummyResponseName = 'utter_dummy_response';


// describe('Follow Up', function() {
//     before(function() {
//         cy.login();
//         cy.fixture('bf_project_id.txt').as('bf_project_id');
//         cy.get('@bf_project_id').then((id) => {
//             cy.createResponse(id, dummyResponseName);
//         });
//         cy.logout();
//     });
    
//     beforeEach(function () {
//         cy.login();
//     });

//     afterEach(function () {
//         cy.logout();
//     });

//     it('Should create response follow-up directive', function() {
//         cy.createResponse(this.bf_project_id, dummyResponseName);
//         cy.wait(200); // somehow necessary after creating a bot response
//         cy.visit(`/project/${this.bf_project_id}/dialogue/templates`);
//         cy.contains('Add bot response').click();
//         cy.get('.ui.toggle.checkbox').click();
//         cy.get('.ui.three.steps').should('be.visible');
//         // Add simple criterium so we can save and retrieve the response
//         cy.get('#nlu-criterium-0 .intent').click();
//         cy.get('#nlu-criterium-0 .intent input').type(`${intentName}{enter}`);
//         cy.contains('Follow-up').click();
//         cy.get('.follow-up-editor').should('be.visible');
//         cy.get('.follow-up-delay-after').should('not.be.visible');
//         cy.get('.follow-up-delay-input').should('not.be.visible');
//         cy.get('.follow-up-delay-seconds').should('not.be.visible');
//         cy.get('.follow-up-delay-tip').should('not.be.visible');
//         cy.get('.follow-up-delay-delete').should('not.be.visible');
//         cy.get('.follow-up-dropdown').click();
//         cy.get('[role=listbox]').contains(dummyResponseName).click();

//         cy.get('.follow-up-delay-after').should('be.visible');
//         cy.get('.follow-up-delay-input').should('be.visible');
//         cy.get('.follow-up-delay-seconds').should('be.visible');
//         cy.get('.follow-up-delay-tip').should('be.visible');
//         cy.get('.follow-up-delay-delete').should('be.visible');
//         cy.contains('Save response').click();
//         cy.url().should('be', `/project/${this.bf_project_id}/dialogue/templates`);
//         cy.deleteResponse(this.bf_project_id, dummyResponseName);
//     });

//     it('Should retreive response and modify it', function() {
//         cy.visit(`/project/${this.bf_project_id}/nlu/models`);
//         // click on 'Bot responses'
//         cy.visit(`/project/${this.bf_project_id}/dialogue/templates`);
//         cy.get('.toggle-nlu-criteria').click();
//         cy.get('.nlu-criteria-filter').type(intentName);
//         // Open bot response and go to follow-up
//         cy.get('[data-cy=edit-response-0]').click();
//         cy.contains('Follow-up').click();
//         // check that the follow-up is still there
//         cy.get('.follow-up-delay-after').should('be.visible');
//         cy.get('.follow-up-delay-input').should('be.visible');
//         cy.get('.follow-up-delay-seconds').should('be.visible');
//         cy.get('.follow-up-delay-tip').should('be.visible');
//         cy.get('.follow-up-delay-delete').should('be.visible');
//         // cy.get('.follow-up-dropdown .search').should('have.value', followupAction);
//         cy.get('.follow-up-delay-delete').click();
//         cy.get('.follow-up-delay-after').should('not.be.visible');
//         cy.get('.follow-up-delay-input').should('not.be.visible');
//         cy.get('.follow-up-delay-seconds').should('not.be.visible');
//         cy.get('.follow-up-delay-tip').should('not.be.visible');
//         cy.get('.follow-up-delay-delete').should('not.be.visible');
//         cy.contains('Save response').click();
//         cy.url().should('be', `/project/${this.bf_project_id}/dialogue/templates`);
//     });

//     it('should delete bot response', function() {
//         cy.visit(`/project/${this.bf_project_id}/nlu/models`);
//         cy.visit(`/project/${this.bf_project_id}/dialogue/templates`);
//         cy.get('.toggle-nlu-criteria').click();
//         cy.get('.nlu-criteria-filter').type(intentName);
//         // Open bot response and go to follow-up
//         cy.get('[data-cy=remove-response-0]').click();
//     });
// });
