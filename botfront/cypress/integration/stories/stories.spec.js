/* eslint-disable no-undef */

const storyGroupOne = 'storyGroupOne';
const storyGroupTwo = 'storyGroupTwo';
const initialText = '## storyGroupOne';
const testText = '## 1234567890 mais alors je ne comprend pas';

describe('stories', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });

    beforeEach(function() {
        cy.login();
    });

    it('should be able to add and delete stories', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        cy.dataCy('add-item').click();
        cy.get('[data-cy=input-item] input').type(`${storyGroupOne}{enter}`);
        cy.contains('storyGroupOne').click();
        cy.dataCy('story-editor').get('textarea');
        cy.dataCy('add-story').click();
        cy.dataCy('story-editor').should('have.lengthOf', 2);
        cy.dataCy('delete-story')
            .first()
            .click();
        cy.dataCy('confirm-yes').click();
        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
        cy.contains(storyGroupTwo).should('not.exist');
    });

    it('should autosave stories as you edit them', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        cy.dataCy('add-item').click();
        cy.get('[data-cy=input-item] input').type(`${storyGroupOne}{enter}`);
        cy.dataCy('add-item').click();
        cy.get('[data-cy=input-item] input').type(`${storyGroupTwo}{enter}`);
        cy.contains(storyGroupOne).click();
        cy.dataCy('story-editor')
            .contains(initialText);
        cy.dataCy('story-editor')
            .get('textarea')
            .type(`{selectall}{backspace}${testText}`, { force: true });
        cy.wait(500);
        cy.contains(storyGroupTwo).click();
        cy.contains(storyGroupOne).click();
        cy.contains(initialText).should('not.exist');
        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
        cy.wait(100);
        cy.contains(storyGroupTwo).click();
        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
    });

    it('should be able to rename storyGroups and select storyGroups', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        cy.dataCy('add-item').click();
        cy.get('[data-cy=input-item] input').type(`${storyGroupOne}{enter}`);
        cy.contains(storyGroupOne).click();
        cy.dataCy('story-editor')
            .contains(initialText);
        cy.dataCy('story-editor')
            .get('textarea')
            .type(`{selectall}{backspace}${testText}`, { force: true });
        cy.wait(500);
        cy.contains(storyGroupOne).trigger('mouseover');
        cy.dataCy('edit-name-icon').click({ force: true });
        // Change name of a story group
        cy.get('[data-cy=edit-name] input').click().type('{backspace}{backspace}{backspace}{enter}');
        cy.contains('storyGroup').should('exist');
        // Initially none of the story groups are selected, therefore content in the train button should be 'Train'
        cy.contains('Train Everything');
        cy.get('.active > #not-selected').click();
        cy.get('#not-selected').click();
        // Text in the train button should change after all the stories are selected
        cy.contains('Partial Training');

        cy.contains('storyGroup').click();
        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
    });

    it('train button hsould be in-sync with seleted stpry groups', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        cy.dataCy('add-item').click();
        cy.get('[data-cy=input-item] input').type(`${storyGroupOne}{enter}`);
        cy.contains(storyGroupOne).click();
        
        // Initially none of the story groups are selected, therefore content in the train button should be 'Train'
        cy.contains('Train');
        cy.get('.active > #not-selected').click();
        cy.get('#not-selected').click();
        // Text in the train button should change after all the stories are selected
        cy.contains('Train all 2 story group');

        cy.contains('storyGroup').click();
        cy.dataCy('delete-story').click();
        cy.dataCy('confirm-yes').click();
    });
});
