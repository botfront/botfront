/* global cy */

describe('story permissions', function() {
    before(() => {
        cy.removeDummyRoleAndUser();
        cy.createProject('bf', 'My Project', 'en');
        cy.visit('/project/bf/stories');
        cy.browseToStory('Get started');
        cy.dataCy('create-branch').click({ force: true });
        cy.dataCy('slots-modal').click();
        cy.dataCy('add-slot').click();
        cy.contains('float').click();
        cy.dataCy('new-slot-editor')
            .find('input')
            .first()
            .type('test');
        cy.dataCy('save-button').click();
        cy.createForm('bf', 'example_form', {
            slots: ['test'],
        });
        cy.createDummyRoleAndUser({ permission: ['stories:r'] });
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

    it('Editing buttons/icons should not exist', function() {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Get started');
        cy.dataCy('story-title').should('exist'); // check that the page was properly loaded
        cy.dataCy('single-story-editor').first().trigger('mouseover');
        cy.dataCy('icon-trash').should('not.exist');
        cy.dataCy('icon-add').should('not.exist');
        cy.dataCy('add-item-to-group').should('not.exist');
        cy.dataCy('add-item').should('have.class', 'disabled');
        cy.get('.item-actions').children().should('have.length', 0);
        cy.get('.item-name').should('have.class', 'uneditable');
        cy.get('.drag-handle').should('have.class', 'hidden');
        cy.dataCy('delete-branch').should('not.exist');
    });

    it('should not be able to edit story title', function() {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Get started');
        cy.dataCy('story-title').should('be.disabled');
    });

    it('should not be able to edit branch name', function() {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Get started');
        cy.dataCy('story-title').should('exist'); // check that the page was properly loaded
        cy.dataCy('branch-label')
            .eq(1)
            .click();
        cy.get('[data-cy=branch-label] span')
            .eq(1)
            .should('exist');
        cy.get('[data-cy=branch-label] input').should('not.exist');
    });

    it('should not be able to edit slots', function() {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Get started');
        cy.dataCy('story-title').should('exist'); // check that the page was properly loaded
        cy.dataCy('slots-modal').click();
        cy.get('form.form .field').each(function(elm) {
            cy.wrap(elm).should('have.class', 'disabled');
        });
        cy.dataCy('save-button').should('not.exist');
        cy.dataCy('delete-slot').should('not.exist');
    });

    it('should not be able to edit story markdown', function() {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Get started');
        cy.dataCy('toggle-md').click();
        cy.dataCy('story-editor')
            .get('textarea')
            .first()
            .focus()
            .type('Test', { force: true })
            .blur();
        cy.get('div.ace_content').should(
            'have.text',
            '* get_started    - utter_get_started',
        )
            .should('not.have.text', 'Test');
    });
    it('should not be able to edit nlu data from the modal', () => {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Greetings');
        cy.dataCy('utterance-text').click();
        cy.dataCy('close-nlu-modal').should('exist');
        cy.dataCy('save-nlu').should('not.exist');
        cy.dataCy('cancel-nlu-changes').should('not.exist');
        cy.dataCy('example-text-editor-input').should('not.exist');
    });
});
