/* eslint-disable camelcase */
/* global cy Cypress:true */
const defaultFormName = 'test1_form';

Cypress.Commands.add('selectForm', (formName = defaultFormName) => {
    cy.dataCy('story-group-menu-item').should('include.text', formName);
    cy.dataCy('story-group-menu-item').contains(formName).click();
});

Cypress.Commands.add('selectFormSlot', (slotName = defaultFormName) => {
    cy.dataCy('story-group-menu-item').should('include.text', slotName);
    cy.dataCy('story-group-menu-item').contains(slotName).click();
    cy.dataCy('form-slot-name').should('include.text', slotName);
});

Cypress.Commands.add('addSlotNode', (parentNode, name) => {
    cy.dataCy(`add-node-${parentNode}`).click();
    cy.dataCy(`add-node-${parentNode}`).find('[data-cy=add-question]').click();
    cy.dataCy('slot-name').find('input').type(`${name}{enter}`);
});

Cypress.Commands.add('addSlotSetNode', (parentNode, type, slotName, slotValue) => {
    cy.dataCy(`add-node-${parentNode}`).click();
    cy.dataCy(`add-node-${parentNode}`).find('[data-cy=set-slot]').click();
    cy.dataCy(`slot-category-${type}`).click({ force: true });
    cy.dataCy(`choose-${slotName}`).click({ force: true });
    cy.dataCy(`value-${slotName}-${slotValue}`).click({ force: true });
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

const getGraphElements = slots => slots.reduce((acc, slot, i) => {
    const previousSlot = slots[i - 1];
    return ([
        ...acc,
        {
            id: slot,
            data: {
                type: 'slot', slotName: slot, filling: [{ type: 'from_entity' }], validation: null,
            },
            position: { x: 120, y: 350 + (i * 150) },
            type: 'slot',
            className: 'expanding-node slot-node',
        },
        {
            id: `${previousSlot || '1'}-${slot}`, source: previousSlot || '1', target: slot, type: 'condition', arrowHeadType: 'arrowclosed', data: { condition: null },
        },
    ]);
},
[{
    id: '1', data: { type: 'start' }, position: { x: 200, y: 200 }, type: 'start', className: 'start-node',
}]);

const getFormTemplate = ({
    projectId, name, slots, collectInBotfront, description, groupId, _id, graph_elements,
}) => ({
    name,
    projectId,
    isExpanded: true,
    pinned: true,
    slots: getSlotTemplates(slots),
    graph_elements: graph_elements || getGraphElements(slots),
    collectInBotfront,
    description,
    groupId,
    _id,
});

Cypress.Commands.add('createForm', (projectId, name, options = {}) => {
    const query = 'mutation($form: FormInput) {\n  upsertForm(form: $form) {\n  _id\n }\n}';
    const variables = {
        form: getFormTemplate({
            projectId, name, slots: [], ...options,
        }),
    };
    return cy.graphQlQuery(query, variables);
});
