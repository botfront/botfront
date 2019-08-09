/* eslint-disable no-undef */

// function createSelection(textNode, start, end) {
//     const selection = window.getSelection();
//     selection.removeAllRanges();
//     const range = document.createRange();
//     range.selectNodeContents(textNode);
//     range.setStart(textNode, start);
//     range.setEnd(textNode, end);
//     selection.addRange(range);
// }

const utterance = 'whatever this is a testing utterance';
const intentName = 'KPI';
const secondIntent = 'chitchat.greet';
const newIntent = 'test';
const newRenameIntent = 'KKPPII';
const secondEntity = 'ENT2';
const newEntity = 'myNewEntity';

describe('nlu tagging in training data', function() {
    before(function() {});

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => {
            cy.login();
            cy.visit('/project/bf/nlu/models');
            cy.get('.nlu-menu-settings').click();
            cy.contains('Import').click();
            cy.fixture('nlu_import.json', 'utf8').then((content) => {
                cy.get('.file-dropzone').upload(content, 'data.json');
            });
            cy.contains('Import Training Data').click();
        });
    });

    afterEach(function() {
        cy.deleteProject('bf');
    });

    it('Should add training data', function() {
        cy.visit('/project/bf/nlu/models');
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type(utterance);
        cy.get('.purple > .ui').click();
        cy.get('.purple > .ui > .search').type(intentName);
        cy.get('[role=listbox]')
            .contains(intentName)
            .click();
        cy.get('[data-cy=save-button]').click();
        cy.visit('/project/bf/nlu/models');
        cy.get('.rt-tbody .rt-tr:first').should('contain', utterance);
        cy.get('.rt-tbody .rt-tr:first')
            .contains(intentName).should('exist');
    });

    // TODO: this test doesn't test anything
    it('should be able to change the intent with a popup', function() {
        cy.visit('/project/bf/nlu/models');
        cy.get('.rt-tbody .rt-tr:first')
            .contains('chitchat.presentation')
            .trigger('mouseover');

        cy.get('[data-cy=intent-dropdown]').click();
        cy.get('[data-cy=intent-dropdown]')
            .contains('chitchat.tell_me_a_joke')
            .click();

        cy.get('.rt-tbody .rt-tr:first').contains('chitchat.tell_me_a_joke');

        // This doesn't work ( as in the popup never disappears)
        // cy.get('.rt-tbody .rt-tr:first').contains(utterance).trigger('mouseover').click();

        // cy.get('[data-cy=intent-popup]').should('not.exist');
    });

    it('should be able to change the intent with a new intent', function() {
        cy.visit('/project/bf/nlu/models');
        cy.get('.rt-tbody .rt-tr:first')
            .contains('chitchat.presentation')
            .trigger('mouseover');

        cy.get('[data-cy=intent-dropdown]').click();
        cy.get('[data-cy=intent-dropdown] input').type(`${newIntent}{enter}`);

        cy.get('.rt-tbody .rt-tr:first').contains(newIntent);

        // cy.wait(1000);
        // cy.get('.rt-tbody .rt-tr:first')
        //     .contains(utterance)
        //     .click();

        // cy.get('[data-cy=intent-popup]').should('not.exist');
    });

    it('should delete the training data', function() {
        cy.visit('/project/bf/nlu/models');
        cy.get('.rt-tbody .rt-tr:first [data-cy=trash] .viewOnHover').click({
            force: true,
        });
        cy.get('.rt-tbody .rt-tr:first').should('not.contain', utterance);
    });

    // it('should be able to rename an intent and rename intents in bot responses at the same time', function() {
    //     // We start by adding a bot response with intentName
    //     cy.get(
    //         `[href="/project/bf/dialogue/templates"] > .item`,
    //     ).click({ force: true });
    //     cy.contains('Add bot response').click();
    //     cy.get('.ui.toggle.checkbox').click();
    //     cy.get('.ui.three.steps').should('be.visible');
    //     cy.get('#nlu-criterium-0 .intent').should('be.visible');
    //     cy.get('.add-criterium-ellipsis').should('not.be.visible');

    //     // Add intent
    //     cy.get('#nlu-criterium-0 .intent').click();
    //     cy.get('#nlu-criterium-0 [role=listbox]')
    //         .contains(intentName)
    //         .click();
    //     cy.contains('Save response').click();
    //     cy.get('.toggle-nlu-criteria').click();
    //     cy.get('.nlu-criteria-filter').type(intentName);
    //     cy.get('[data-cy=remove-response-0]');
    //     cy.get('[data-cy=remove-response-1]').should('not.exist');

    //     // Then we go in training data
    //     cy.visit(`/project/bf/nlu/models`);
    //     cy.contains('Training Data').click();

    //     // And create a training data with an intent of intentName
    //     cy.contains('Insert many').click();
    //     cy.get('.batch-insert-input').type(utterance);
    //     cy.get('.purple > .ui').click();
    //     cy.get('.purple > .ui > .search').type(intentName);
    //     cy.get('[role=listbox]')
    //         .contains(intentName)
    //         .click();
    //     cy.get('[data-cy=save-button]').click();
    //     cy.contains('Examples').click();

    //     // We try renaming it without renaming the bot responses
    //     cy.get('.rt-tbody .rt-tr:first')
    //         .contains(intentName)
    //         .trigger('mouseover');
    //     cy.get('[data-cy=rename-intent]').click();
    //     cy.get('.rt-tbody .rt-tr:first input').type(`{selectAll}{del}${newRenameIntent}{enter}`);
    //     cy.get('[data-cy=rename-intent-confirm-modal]')
    //         .contains('OK')
    //         .click();
    //     cy.get('[data-cy=rename-responses-confirm-modal]')
    //         .contains('No')
    //         .click();

    //     // We check that the bot response has indeed NOT been modified
    //     cy.get(
    //         `[href="/project/bf/dialogue/templates"] > .item`,
    //     ).click({ force: true });
    //     cy.get('.toggle-nlu-criteria').click();
    //     cy.get('.nlu-criteria-filter').type(newRenameIntent);
    //     cy.get('[data-cy=remove-response-0]').should('not.exist');
    //     cy.get('.nlu-criteria-filter').type(`{selectAll}{del}${intentName}`);
    //     cy.get('[data-cy=remove-response-0]');
    //     // Cool

    //     // Then we go back in training data
    //     cy.visit(`/project/bf/nlu/models`);
    //     // cy.get('.card:first button.primary', { timeout: 10000 }).click();
    //     cy.contains('Training Data').click();

    //     // Rename it to the original intentName
    //     cy.get('.rt-tbody .rt-tr:first')
    //         .contains(newRenameIntent)
    //         .trigger('mouseover');
    //     cy.get('[data-cy=rename-intent]').click();
    //     cy.get('.rt-tbody .rt-tr:first input').type(`{selectAll}{del}${intentName}{enter}`);
    //     cy.get('[data-cy=rename-intent-confirm-modal]')
    //         .contains('OK')
    //         .click();

    //     // And renaming it again but this time we decide to also rename the bot responses
    //     cy.get('.rt-tbody .rt-tr:first')
    //         .contains(intentName)
    //         .trigger('mouseover');
    //     cy.get('[data-cy=rename-intent]').click();
    //     cy.get('.rt-tbody .rt-tr:first input').type(`{selectAll}{del}${newRenameIntent}{enter}`);
    //     cy.get('[data-cy=rename-intent-confirm-modal]')
    //         .contains('OK')
    //         .click();
    //     cy.get('[data-cy=rename-responses-confirm-modal]')
    //         .contains('Yes')
    //         .click();

    //     // deleting the utterance
    //     cy.get('.rt-tbody .rt-tr:first i.delete').click();
    //     cy.get('.rt-tbody .rt-tr:first').should('not.contain', utterance);

    //     // checking that this time, the bot response intent has been renamed
    //     cy.get(
    //         `[href="/project/bf/dialogue/templates"] > .item`,
    //     ).click({ force: true });
    //     cy.get('.toggle-nlu-criteria').click();
    //     cy.get('.nlu-criteria-filter').type(newRenameIntent);
    //     // And deleting it, effetively resetting the state
    //     cy.get('[data-cy=remove-response-0]').click();
    // });

    it('should be able to change an entity with a popup', function() {
        cy.visit('/project/bf/nlu/models');
        cy.get('.rt-tbody .rt-tr:first')
            .contains('Matthieu')
            .trigger('mouseover');

        cy.get('[data-cy=entity-dropdown]').click();
        cy.get('[data-cy=entity-dropdown]')
            .contains(secondEntity)
            .click();

        // cy.get('[data-cy=trigger-entity-names]').click();

        cy.get('.rt-tbody .rt-tr:first').contains(secondEntity);

        cy.visit('/project/bf/nlu/models');
        cy.contains('Training Data').click();
        // cy.get('[data-cy=trigger-entity-names]').click();

        cy.get('.rt-tbody .rt-tr:first').contains(secondEntity);
    });

    it('should be able to change an entity with a popup to a new entity', function() {
        cy.visit('/project/bf/nlu/models');
        cy.get('.rt-tbody .rt-tr:first')
            .contains('Matthieu')
            .trigger('mouseover');

        cy.get('[data-cy=entity-dropdown]').click();
        cy.get('[data-cy=entity-dropdown] input').type(`${newEntity}{enter}`);

        // cy.get('[data-cy=trigger-entity-names]').click();

        cy.get('.rt-tbody .rt-tr:first').contains(newEntity);

        cy.visit('/project/bf/nlu/models');
        cy.contains('Training Data').click();
        // cy.get('[data-cy=trigger-entity-names]').click();

        cy.get('.rt-tbody .rt-tr:first').contains(newEntity);
    });
});

// This describe cant be run because of meteor deps not existing in cypress runs

// import * as Utils from '../../../imports/api/nlu_model/nlu_model.utils';

// describe('renaming intents in templates', function() {

//     // several intents
//     // several intents in one nlu property
//     const projectTemplates1 = [
//         {
//             match: {
//                 nlu: [],
//             },
//         },
//         {
//             match: {
//                 nlu: [
//                     {
//                         intent: 'test',
//                     },
//                 ],
//             },
//         },
//         {
//             match: {
//                 nlu: [
//                     {
//                         intent: 'test',
//                         entities: [],
//                     },
//                     { intent: 'test' },
//                 ],
//             },
//         },
//     ];

//     // no intents
//     // no match property
//     // no nlu property
//     const projectTemplates2 = [
//         {
//             match: {
//                 nlu: [],
//             },
//         },
//         {},
//         {
//             match: {},
//         },
//     ];

//     // one intent
//     const projectTemplates3 = [
//         {
//             match: {
//                 nlu: [{ intent: 'test' }],
//             },
//         },
//         {
//             match: {
//                 nlu: [{ intent: 'bar' }],
//             },
//         },
//         {
//             match: {
//                 nlu: [{ intent: 'try' }],
//             },
//         },
//     ];

//     it('renames several intents and several intents in one nlu property', function() {
//         const output = Utils.renameIntentsInTemplates(projectTemplates1, 'test', 'foo');
//         expect(output[1].match.nlu[0].intent).to.be.equal('foo');
//         expect(output[2].match.nlu[0].intent).to.be.equal('foo');
//         expect(output[2].match.nlu[1].intent).to.be.equal('foo');
//     });

//     it('doesnt crash on renaming templates with no matching intents and no nlu property', function() {
//         const output = Utils.renameIntentsInTemplates(projectTemplates2, 'test', 'foo');
//         expect(output).to.deep.equal(projectTemplates2);
//     });

//     it('renames one intent', function() {
//         const output = Utils.renameIntentsInTemplates(projectTemplates3, 'test', 'foo');
//         expect(output[0].match.nlu[0].intent).to.be.equal('foo');
//         const modifiedExample3 = projectTemplates3;
//         modifiedExample3[0].match.nlu[0].intent = 'foo';
//         expect(output).to.deep.equal(modifiedExample3);
//     });
// });
