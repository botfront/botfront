
/* global cy:true */

describe('nlu editor modal tests', () => {
    const cancelChanges = () => {
        cy.dataCy('cancel-nlu-changes').click();
        cy.dataCy('confirm-yes').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
    };
    beforeEach(() => {
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login());
        cy.createStoryGroup();
        cy.createStoryInGroup();
        cy.browseToStory();
        cy.addUtteranceLine({ intent: 'shopping', entities: [{ value: 'provigo', name: 'shop' }] });
        cy.importNluData('bf', 'nlu_entity_sample.json', 'en');
        cy.train();
    });
    afterEach(() => {
        cy.logout();
        cy.deleteProject('bf');
    });
    it('should be able to add, edit, toggle canonical and delete examples through the nlu modal', () => {
        cy.visit('/project/bf/stories');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('nlu-editor-modal').find('[data-cy=icon-trash]').last().click();
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
        cy.visit('/project/bf/stories');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().type('Hello jim{enter}');
        cy.dataCy('save-nlu').should('have.class', 'disabled');
        cy.dataCy('nlu-editor-modal').find('[data-cy=icon-trash]').first().click();
        cy.dataCy('save-nlu').should('not.have.class', 'disabled');
    });
    it('should not be able to save changes when there is an invalid example', () => {
        cy.visit('/project/bf/stories');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().type('Hello jim\nI will go to costco{enter}');
        cy.get('.example-data-table').find('[data-cy=intent-label]').should('have.length', 4);
        cy.dataCy('nlu-modification-label').contains('new').should('exist');
        cy.dataCy('nlu-modification-label').contains('invalid').should('exist');
    });
    it('should show a popup on Cancel when any change has been made', () => {
        cy.visit('/project/bf/stories');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().type('Hello jim{enter}');
        cancelChanges();
        cy.dataCy('utterance-text').click();
        cy.dataCy('example-text-editor-input').click().type('I will go to costco{enter}');
        cancelChanges();
        cy.dataCy('utterance-text').click();
        cy.dataCy('nlu-editor-modal').find('[data-cy=icon-trash]').first().click();
        cancelChanges();
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-edit').first().click({ force: true });
        cy.dataCy('example-editor-form').find('[data-cy=example-text-editor-input]').type(' tonight{enter}');
        cancelChanges();
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-gem').first().click();
        cancelChanges();
    });
    it('should modify canonical', () => {
        cy.visit('/project/bf/stories');
        cy.browseToStory();
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-gem').first().click();
        cy.dataCy('example-text-editor-input').click().type('I will probably go to costco{enter}');
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-gem').eq(1).should('have.class', 'active');
        cy.dataCy('icon-gem').first().click();
        cy.dataCy('save-nlu').click();
        cy.dataCy('nlu-editor-modal').should('not.exist');
        cy.dataCy('utterance-text').click();
        cy.dataCy('icon-gem').first().should('have.class', 'active');
        cy.dataCy('icon-gem').eq(1).should('not.have.class', 'active');
    });
});
