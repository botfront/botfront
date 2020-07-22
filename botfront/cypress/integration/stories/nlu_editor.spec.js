
/* global cy:true */

describe('nlu editor modal tests', () => {
    const cancelChanges = () => {
        cy.dataCy('cancel-nlu-changes').click();
        cy.dataCy('confirm-yes').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
    };
    beforeEach(() => {
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login());
        cy.visit('/project/bf/dialogs');
        cy.createStoryGroup();
        cy.createStoryInGroup();
        cy.browseToStory();
        cy.addUtteranceLine({ intent: 'shopping', entities: [{ value: 'costco', name: 'shop' }] });
        cy.importNluData('bf', 'nlu_entity_sample.json', 'en');
        cy.train();
    });
    afterEach(() => {
        cy.logout();
        cy.deleteProject('bf');
    });
    it('should be able to add, edit, toggle canonical and delete examples through the nlu modal', () => {
        cy.visit('/project/bf/dialogs');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('nlu-editor-modal').find('[data-cy=icon-trash]').last().click({ force: true });
        cy.get('.example-table-row').first().trigger('mouseover');
        cy.dataCy('icon-edit').should('exist'); // check appear on hover works correctly
        cy.dataCy('icon-edit').first().click({ force: true });
        cy.dataCy('example-editor-form').find('[data-cy=example-text-editor-input]').type(' tonight{enter}');
        cy.dataCy('example-text-editor-input').click().type('I will go to costco{enter}');
        cy.dataCy('nlu-modification-label').contains('deleted').should('exist');
        cy.dataCy('nlu-modification-label').contains('new').should('exist');
        cy.dataCy('nlu-modification-label').contains('edited').should('exist');
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.dataCy('utterance-text').click();
        cy.dataCy('nlu-editor-modal').find('[data-cy=utterance-text]').should('have.length', 3); // one extra from the header
        cy.dataCy('utterance-text').find('span').contains('I am going to').should('exist');
        cy.dataCy('utterance-text').contains('I will go to').should('exist');
    });
    it('should not be able to save changes when there is an invalid example', () => {
        cy.visit('/project/bf/dialogs');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().type('Hello jim{enter}');
        cy.dataCy('nlu-modification-label').contains('invalid').should('exist');
        cy.dataCy('save-nlu').should('have.class', 'disabled');
        cy.dataCy('nlu-editor-modal').find('[data-cy=icon-trash]').first().click({ force: true });
        cy.dataCy('save-nlu').should('not.have.class', 'disabled');
    });
    it('should create multiple examples when pasting multiple lines', () => {
        cy.visit('/project/bf/dialogs');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().fill('Hello jim\nI will go to costco').type('{enter}');
        cy.get('.example-data-table').find('[data-cy=intent-label]').should('have.length', 4);
        cy.dataCy('nlu-modification-label').contains('new').should('exist');
        cy.dataCy('nlu-modification-label').contains('invalid').should('exist');
    });
    it('should show a popup on Cancel when any change has been made', () => {
        cy.visit('/project/bf/dialogs');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().type('Hello jim{enter}');
        cy.dataCy('nlu-modification-label').contains('invalid').should('exist');
        cancelChanges();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().type('I will go to costco{enter}');
        cy.dataCy('nlu-modification-label').contains('new').should('exist');
        cancelChanges();
        cy.dataCy('utterance-text').click();
        cy.dataCy('nlu-editor-modal').find('[data-cy=icon-trash]').first().click({ force: true });
        cy.dataCy('nlu-modification-label').contains('deleted').should('exist');
        cancelChanges();
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-edit').first().click({ force: true });
        cy.dataCy('example-editor-form').find('[data-cy=example-text-editor-input]').type(' tonight{enter}');
        cy.dataCy('nlu-modification-label').contains('edited').should('exist');
        cancelChanges();
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-gem').first().click({ force: true });
        cy.dataCy('icon-gem').first().should('have.class', 'active');
        cancelChanges();
    });
    it('should modify canonical', () => {
        cy.visit('/project/bf/dialogs');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-gem').first().click({ force: true });
        cy.dataCy('icon-gem').first().should('have.class', 'active');
        cy.dataCy('example-text-editor-input').click().type('I will probably go to costco{enter}');
        cy.get('.example-data-table').find('[data-cy=intent-label]').should('have.length', 3);
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-gem').eq(1).should('have.class', 'active');
        cy.dataCy('icon-gem').first().click({ force: true });
        cy.dataCy('icon-gem').first().should('have.class', 'active');
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.dataCy('utterance-text').contains('I will probably go to').should('exist');
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-gem').first().should('have.class', 'active');
        cy.dataCy('icon-gem').eq(1).should('not.have.class', 'active');
    });
});

describe('auto-assingment of canonical in the nlu editor', () => {
    beforeEach(() => {
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login());
        cy.visit('/project/bf/dialogs');
        cy.createStoryGroup();
        cy.createStoryInGroup();
        cy.browseToStory();
        cy.addUtteranceLine({ intent: 'shopping' });
        cy.importNluData('bf', 'nlu_sample_en.json', 'en');
        cy.train();
    });
    afterEach(() => {
        cy.logout();
        cy.deleteProject('bf');
    });
    it('should set the first example to canonical and refresh the story editor', () => {
        cy.visit('/project/bf/dialogs');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().fill('I will go shopping').type('{enter}');
        cy.dataCy('icon-gem').first().should('have.class', 'active');
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');

        cy.dataCy('utterance-text').children('span').should('have.text', 'I will go shopping');
    });
    it('should set the first example to canonical and refresh the story editor', () => {
        cy.visit('/project/bf/dialogs');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().fill('hello').type('{enter}');
        cy.dataCy('icon-gem').should('not.have.class', 'active');
        cy.get('.example-data-table').find('[data-cy=intent-label]').click();
        cy.dataCy('intent-dropdown').find('.intent-label').contains('shopping').click();
        cy.dataCy('icon-gem').should('have.class', 'active');
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');

        cy.dataCy('utterance-text').children('span').should('have.text', 'hello');
    });
    it('should set the first example to canonical and refresh the story editor', () => {
        cy.visit('/project/bf/dialogs');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().fill('I will go shopping').type('{enter}');

        cy.dataCy('icon-gem').last().should('have.class', 'active');
        cy.dataCy('icon-gem').last().click();
        cy.wait(200);
        cy.dataCy('icon-edit').last().should('not.have.class', 'disabled');
        cy.dataCy('icon-gem').last().should('not.have.class', 'active');
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.dataCy('utterance-text').children('span').should('have.text', 'I will go shopping');

        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-edit').click({ force: true });
        cy.dataCy('example-editor-form').find('[data-cy=example-text-editor-input]').type(' edited{enter}');

        cy.dataCy('nlu-modification-label').contains('edited').should('exist');
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.dataCy('utterance-text').children('span').should('have.text', 'I will go shopping edited');

        cy.dataCy('utterance-text').click();
        cy.get('.example-data-table').find('[data-cy=icon-trash]').click({ force: true });
        cy.dataCy('nlu-modification-label').contains('deleted').should('exist');
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.dataCy('utterance-text').children('span').should('not.exist');
    });
});
