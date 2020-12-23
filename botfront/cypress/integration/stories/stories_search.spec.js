/* global cy:true */

describe('test stories searching ui', () => {
    beforeEach(() => {
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login());
    });
    afterEach(() => {
        cy.logout();
        cy.deleteProject('bf');
    });

    const searchStories = (searchString, fragmentName /* used to click on the right result */, options = {}) => {
        const { addToOpen } = options;
        cy.dataCy('stories-search-bar').find('input').clear({ force: true });
        cy.dataCy('stories-search-item').should('have.length', 0);
        cy.dataCy('stories-search-bar').find('input').type(searchString, { force: true });
        cy.dataCy('stories-search-bar').find('input').should('have.value', searchString);
        cy.dataCy('stories-search-bar').should('not.have.class', 'loading');
        cy.wait(1000);
        if (addToOpen) {
            cy.dataCy('stories-search-item').contains(fragmentName).parent().find('[data-cy=add-search-result-to-open]')
                .click({ force: true });
        } else {
            cy.dataCy('stories-search-item').contains(fragmentName).click();
        }
        cy.dataCy('stories-search-bar').find('input').trigger('keydown', { key: 'Escape' });
    };

    it('should find stories created on project init', () => {
        cy.visit('project/bf/dialogue');
        searchStories('greetings', 'Greetings');
        cy.dataCy('story-title').should('have.value', 'Greetings');
        searchStories('utter_get_started', 'Get started');
        cy.dataCy('story-title').should('have.value', 'Get started');
    });
    it('should index stories that are created and edited in the app', () => {
        cy.visit('project/bf/dialogue');
        cy.createStoryGroup({ groupName: 'test group' });
        cy.createFragmentInGroup({ groupName: 'test group', fragmentName: 'types of fruit' });
        searchStories('types', 'types of fruit');
        cy.dataCy('story-title').should('have.value', 'types of fruit');
        cy.dataCy('user-line-from-input').last().click({ force: true });
        cy.addUserUtterance('kiwi', 'fruit_name');
        cy.dataCy('save-new-user-input').click();
        cy.dataCy('story-group-menu-item').contains('types of fruit').dblclick();
        cy.dataCy('edit-name').find('input').clear().type('food{enter}');
        searchStories('food', 'food');
        cy.dataCy('story-title').should('have.value', 'food');
        searchStories('kiwi', 'food');
        cy.dataCy('story-title').should('have.value', 'food');
    });
    it('should find stories created on project init', () => {
        cy.visit('project/bf/dialogue');
        cy.createStoryGroup({ groupName: 'test group A' });
        cy.createFragmentInGroup({ groupName: 'test group A', fragmentName: 'title A' });
        cy.createStoryGroup({ groupName: 'test group B' });
        cy.createFragmentInGroup({ groupName: 'test group B', fragmentName: 'title B' });
        cy.toggleStoryGroupCollapsed({ groupName: 'test group A' });
        cy.toggleStoryGroupCollapsed({ groupName: 'test group B' });
        searchStories('title', 'title A', { addToOpen: true });
        cy.dataCy('story-title').should('have.length', 2);
        cy.dataCy('story-title').last().should('have.value', 'title B');
        cy.dataCy('story-title').first().should('have.value', 'title A');
        searchStories('title', 'title B', { addToOpen: true });
        cy.dataCy('story-title').should('have.length', 1);
        cy.dataCy('story-title').should('have.value', 'title A');
    });
    it('should link to forms from stories search', () => {
        cy.visit('project/bf/dialogue');
        cy.createCustomStoryGroup('bf', 'FORM_GROUP', 'Form group');
        cy.dataCy('story-group-menu-item').should('include.text', 'Form group');
        cy.createForm('bf', 'test_form', { slots: ['color', 'type'], groupId: 'FORM_GROUP' });
        searchStories('test_form', 'test_form');
        cy.get('.slot-node-header').should('have.length', 2);
        cy.get('.slot-node-header').should('have.text', 'colortype');
    });
});
