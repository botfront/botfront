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
        cy.createDummyRoleAndUser({ permission: ['stories:r'] });
    });

    beforeEach(() => {
        cy.login({ admin: false });
    });
    afterEach(() => {
        cy.logout();
    });

    after(() => {
        cy.login().then(() => cy.removeDummyRoleAndUser());
        cy.logout();
        cy.deleteProject('bf');
    });

    it('Editing buttons/icons should not exist', function() {
        cy.visit('/project/bf/stories');
        cy.browseToStory('Get started');
        cy.dataCy('story-title').should('exist'); // check that the page was properly loaded

        cy.dataCy('add-item').should('have.class', 'disabled');
        cy.get('.item-actions').should('have.class', 'hidden');
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
});
