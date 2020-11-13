
/* global cy:true */
describe('training data import', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('should create modify and delete and entity', () => {
        cy.visit('project/bf/nlu/model/en');
        cy.addExamples(['test test test'], 'test');
        cy.dataCy('utterance-text').should('exist');
        cy.addEntity('test test test', 1, 5);
        // set entity
        cy.dataCy('entity-dropdown').click();
        cy.dataCy('entity-dropdown').type('test_entity{enter}');
        cy.dataCy('entity-text').should('have.text', 'test');
        // set role group and value
        cy.dataCy('entity-text').click();
        cy.dataCy('add-entity-value').click();
        cy.dataCy('entity-value-input').click().type('value_test');
        cy.dataCy('add-entity-group').click();
        cy.dataCy('entity-group-input').click().type('test_group');
        cy.dataCy('add-entity-role').click();
        cy.dataCy('entity-role-input').click().type('test_role{esc}');
        cy.dataCy('entity-name').should('include.text', '★');
        cy.dataCy('entity-text').should('include.text', '≪"value_test"≫');
        // delete role group and value
        cy.dataCy('entity-text').click();
        cy.dataCy('entity-popup').find('[data-cy=icon-trash]').eq(3).click();
        cy.dataCy('entity-popup').find('[data-cy=icon-trash]').eq(2).click();
        cy.dataCy('entity-popup').find('[data-cy=icon-trash]').eq(1).click();
        cy.dataCy('utterance-text').click();
        cy.dataCy('entity-name').should('not.include.text', '★');
        cy.dataCy('entity-text').should('not.include.text', '≪"value_test"≫');
        // delete entity
        cy.dataCy('entity-text').click();
        cy.dataCy('entity-popup').find('[data-cy=icon-trash]').click();
        cy.dataCy('confirm-entity-deletion').click();
        cy.dataCy('entity-label').should('not.exist');
    });

    it('should improve entity selection', () => {
        cy.visit('project/bf/nlu/model/en');
        cy.addExamples(['test , test test'], 'test');
        cy.dataCy('utterance-text').should('exist');
        // This one only selects whitespaces so it should not select anything at all !
        cy.addEntity('test , test test', 5, 7);
        cy.dataCy('entity-dropdown').should('not.exist');
        cy.dataCy('selected-entity').should('not.exist');

        // this one selects whitespace and the first two chars of the second "test" so it should refine the selection to contain text.
        cy.addEntity('test , test test', 5, 9);
        cy.dataCy('entity-dropdown');
        cy.dataCy('selected-entity').should('have.text', 'test');
    });

    it('should create an entity in non-whitespace mode', () => {
        cy.visit('project/bf/nlu/model/en');
        // enable non-whitespace mode
        cy.dataCy('nlu-menu-settings').click();
        cy.dataCy('whitespace-option').find('.ui.checkbox').click();
        cy.dataCy('save-button').click();
        cy.dataCy('changes-saved').should('exist');
        cy.dataCy('nlu-menu-training-data').click();
        cy.addExamples(['test test test'], 'test');
        cy.dataCy('utterance-text').should('exist');
        // verify entities don't have to start adjacent to whitespace
        cy.addEntity('test test test', 1, 5);
        cy.dataCy('entity-dropdown').click();
        cy.dataCy('entity-dropdown').type('test_entity{enter}');
        cy.dataCy('entity-text').should('have.text', 'est ');
    });
});
