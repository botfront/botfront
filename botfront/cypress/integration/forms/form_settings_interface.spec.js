/* global cy */

const catSlot = 'catSlot';

const newFormName = 'testEdited_form';
const description = 'this is test text';
const entityName = 'shop';


describe('use the main form editor interface to', () => {
    beforeEach(() => {
        cy.createProject('bf', 'My Project', 'en');
        cy.login();
    });
    afterEach(() => {
        cy.deleteProject('bf');
    });
    it('should edit the form name, description, slots, and collect in botfront status', () => {
        cy.visit('project/bf/stories');
        cy.manuallyCreateForm();
        cy.meteorAddSlot('catSlot', 'categorical');
        cy.meteorAddSlot('textSlot', 'text');
        cy.meteorAddSlot('boolSlot', 'bool');
        cy.meteorAddSlot('floatSlot', 'float');
        cy.meteorAddSlot();
        cy.editFormSettings({
            name: newFormName,
            description,
            slot: catSlot,
        });
        cy.reload();
        cy.selectForm(newFormName);
        cy.dataCy('form-name-field').find('input').should('have.value', newFormName);
        cy.dataCy('form-description-field').find('textarea').should('have.value', description);
        cy.dataCy('story-group-menu-item').should('include.text', catSlot);
        cy.removeSlotFromForm(catSlot);
        // test name checker
        cy.dataCy('form-name-field').click();
        cy.dataCy('form-name-field').find('input').clear().type('test1')
            .blur();
        cy.dataCy('form-submit-field').click({ force: true });
        cy.dataCy('form-name-field').should('have.class', 'error');
        // test name checker
        cy.dataCy('form-name-field').click();
        cy.dataCy('form-name-field').find('input').clear().type('test1form_form')
            .blur();
        cy.dataCy('form-submit-field').click({ force: true });
        cy.dataCy('form-name-field').should('have.class', 'error');
        // test name checker
        cy.dataCy('form-name-field').click();
        cy.dataCy('form-name-field').find('input').clear().type('test1_form')
            .blur();
        cy.dataCy('form-submit-field').click({ force: true });
        cy.dataCy('form-name-field').should('not.have.class', 'error');
    });
    it('should change the response type via the dropdown', () => {
        cy.visit('project/bf/stories');
        cy.meteorAddSlot('catSlot', 'categorical');
        cy.createForm('bf', 'test1_form', {
            slots: [catSlot],
        });
        cy.visit('project/bf/stories');
        cy.get('.loader').should('not.exist');
        cy.selectFormSlot(catSlot);
        // check quick reply responses
        cy.dataCy('change-response-type').click();
        cy.dataCy('change-response-type').find('span').contains('quick reply').click();
        cy.dataCy('bot-response-input').find('textarea').should('exist');
        cy.dataCy('button_title').should('exist');
        cy.dataCy('icon-pin').should('not.have.class', 'light-green');
        // check button responses
        cy.dataCy('change-response-type').find('span').contains('buttons').click({ force: true });
        cy.dataCy('bot-response-input').find('textarea').should('exist');
        cy.dataCy('button_title').should('exist');
        cy.dataCy('icon-pin').should('have.class', 'light-green');
        // check carousel responses
        cy.dataCy('change-response-type').find('span').contains('carousel').click({ force: true });
        cy.dataCy('add-slide').should('exist');
        cy.dataCy('image-container').should('exist');
        // check custom responses
        cy.dataCy('change-response-type').find('span').contains('custom').click({ force: true });
        cy.dataCy('edit-custom-response').click();
        cy.dataCy('custom-response-editor').should('exist');
        cy.escapeModal();
        // check responses
        cy.dataCy('change-response-type').find('span').contains('text').click({ force: true });
        cy.dataCy('edit-custom-response').should('not.exist');
        cy.dataCy('bot-response-input').find('textarea').should('exist');
        // edit response
        cy.dataCy('bot-response-input').find('textarea').type('categorical slot').blur();
        cy.reload();
        cy.selectFormSlot(catSlot);
        cy.dataCy('bot-response-input').find('textarea').should('have.text', 'categorical slot');
    });
    it('set all slot types', () => {
        cy.visit('project/bf/stories');
        cy.importNluData('bf', 'nlu_entity_sample.json', 'en');
        cy.meteorAddSlot('catSlot', 'categorical');
        cy.createForm('bf', 'test1_form', {
            slots: [catSlot],
        });
        cy.selectFormSlot(catSlot);
        cy.dataCy('form-top-menu-item').contains('Extraction').click();
        cy.dataCy('entity-value-dropdown').click('').find('span');
        cy.dataCy('entity-value-dropdown').contains(entityName).click();
        cy.dataCy('add-condition').click();
        cy.dataCy('extraction-source-dropdown').should('have.length', 2);
        cy.dataCy('extraction-source-dropdown').last().click();
        cy.dataCy('extraction-source-dropdown').last().find('span').contains('intent')
            .click();
        cy.dataCy('intent-condition-dropdown').last().click();
        cy.dataCy('intent-condition-dropdown').last().find('span').contains('NOT')
            .click();
        cy.dataCy('intent-condition-multiselect').last().click();
        cy.dataCy('intent-condition-multiselect').last().find('span').contains('chitchat.greet')
            .click();
        cy.dataCy('intent-condition-multiselect').last().find('span').contains('chitchat.bye')
            .click();
        cy.dataCy('category-value-dropdown').last().click();
        cy.dataCy('category-value-dropdown').last().find('span').contains('blue')
            .click();
        cy.dataCy('add-condition').click();
        cy.dataCy('extraction-source-dropdown').should('have.length', 3);
        cy.dataCy('extraction-source-dropdown').last().click();
        cy.dataCy('extraction-source-dropdown').last().find('span').contains('From the user message')
            .click();
        cy.dataCy('extraction-source-dropdown').find('div.text').contains('From the user message');
        cy.reload();
        cy.selectFormSlot(catSlot);
        cy.dataCy('form-top-menu-item').contains('Extraction').click();
        cy.dataCy('extraction-source-dropdown').should('have.length', 3);
        // sources
        cy.dataCy('extraction-source-dropdown').eq(0).find('div.text').should('have.text', 'From the entity');
        cy.dataCy('extraction-source-dropdown').eq(1).find('div.text').should('have.text', 'Conditionally on the intent');
        cy.dataCy('extraction-source-dropdown').eq(2).find('div.text').should('have.text', 'From the user message');
        // values
        cy.get('.ui.label').contains('shop').should('exist');
        cy.get('.ui.label').contains('chitchat.greet').should('exist');
        cy.get('.ui.label').contains('chitchat.bye').should('exist');
        cy.dataCy('category-value-dropdown').find('div.text').should('have.text', 'blue');
        cy.get('.story-card').find('[data-cy=icon-trash]').last().click();
        cy.get('.story-card').find('[data-cy=icon-trash]').first().click();
        cy.dataCy('extraction-source-dropdown').should('have.length', 1);
        cy.dataCy('intent-condition-dropdown').click();
        cy.dataCy('intent-condition-dropdown').find('span').contains('if the intent is one of').click();
        cy.dataCy('intent-condition-dropdown').find('div.text').should('have.text', 'if the intent is one of');
        cy.reload();
        cy.selectFormSlot(catSlot);
        cy.dataCy('form-top-menu-item').contains('Extraction').click();
        cy.dataCy('extraction-source-dropdown').should('have.length', 1);
        cy.dataCy('intent-condition-dropdown').click();
        cy.dataCy('intent-condition-dropdown').find('span').contains('if the intent is one of').click();
        cy.dataCy('intent-condition-dropdown').find('div.text').should('have.text', 'if the intent is one of');
    });
});
