/* global cy Cypress:true */
const defaultFormName = 'test1_form';

Cypress.Commands.add('selectForm', (formName = defaultFormName) => {
    cy.dataCy('story-group-menu-item').should('include.text', formName);
    cy.dataCy('story-group-menu-item').contains(formName).click();
    cy.dataCy('form-name-field').find('input').should('have.value', formName);
});

Cypress.Commands.add('selectFormSlot', (slotName = defaultFormName) => {
    cy.dataCy('story-group-menu-item').should('include.text', slotName);
    cy.dataCy('story-group-menu-item').contains(slotName).click();
    cy.dataCy('form-slot-name').should('include.text', slotName);
});

Cypress.Commands.add('manuallyCreateForm', (formName = defaultFormName) => {
    cy.dataCy('add-item').click();
    cy.dataCy('add-form').click();
    cy.dataCy('add-item-input').type(`${formName}{enter}`);
    cy.selectForm(formName);
});

Cypress.Commands.add('addSlotToForm', (name) => {
    cy.dataCy('form-slots-field').click().find('span.text').contains(name)
        .click();
    cy.dataCy('form-slots-field').find('input').blur();
});

Cypress.Commands.add('editFormSettings', ({
    name, description, slot,
}) => {
    cy.addSlotToForm(slot);
    cy.dataCy('form-name-field').click();
    cy.dataCy('form-name-field').find('input').clear().type(name);
    cy.dataCy('form-description-field').click();
    cy.dataCy('form-description-field').find('textarea').clear().type(description)
        .blur();
    cy.get('.ui.label').contains(slot).should('exist');
    cy.dataCy('form-name-field').find('input').should('have.value', name);
    cy.dataCy('form-description-field').find('textarea').should('have.value', description);
    cy.get('.ui.label').contains(slot).should('exist');
    cy.dataCy('form-submit-field').click();
});

Cypress.Commands.add('removeSlotFromForm', (slot) => {
    cy.dataCy('form-slots-field').find('.ui.label').contains(slot).find('.close.icon')
        .click();
    cy.dataCy('confirm-yes').click();
    cy.dataCy('form-slots-field').find('.ui.label').should('not.include.text', slot);
    cy.dataCy('form-submit-field').click();
    cy.dataCy('story-group-menu-item').should('not.include.text', slot);
});


const getSlotTemplates = slots => slots.map(name => ({ name }));

const getFormTemplate = ({
    projectId, _id, name, slots, collectInBotfront, description,
}) => ({
    name,
    projectId,
    isExpanded: true,
    pinned: true,
    slots: getSlotTemplates(slots),
    collectInBotfront,
    description,
});

Cypress.Commands.add('createForm', (projectId, name, options) => {
    const query = 'mutation($form: FormInput) {\n  upsertForm(form: $form) {\n  success\n }\n}';
    const variables = {
        form: getFormTemplate({
            projectId, name, ...options,
        }),
    };
    cy.graphQlQuery(query, variables);
});
