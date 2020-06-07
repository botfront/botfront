/* global cy Cypress expect */

const getSlotData = (type) => {
    switch (type) {
    case 'text':
        return ({
            _id: 'TextSlot',
            projectId: 'bf',
            name: 'textSlot',
            type: 'text',
        });
    case 'categorical':
        return {
            _id: 'CatSlot',
            projectId: 'bf',
            name: 'catSlot',
            type: 'categorical',
            categories: ['blue', 'red', 'orange', 'yellow'],
        };
    case 'bool':
        return {
            _id: 'BoolSlot',
            projectId: 'bf',
            name: 'catSlot',
            type: 'bool',
        };
    case 'float':
        return {
            _id: 'FloatSlot',
            projectId: 'bf',
            name: 'floatSlot',
            type: 'float',
        };
    default:
        return {
            _id: 'DefaultSlot',
            projectId: 'bf',
            name: 'defaultSlot',
            type: 'text',
        };
    }
};

Cypress.Commands.add('meteorAddSlot', (type) => {
    const slotData = getSlotData(type);
    cy.MeteorCall('slots.insert', [slotData, 'bf']);
});
