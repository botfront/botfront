/* global cy Cypress */

const getSlotData = (name = 'testSlot', type) => {
    switch (type) {
    case 'text':
        return ({
            _id: 'TextSlot',
            projectId: 'bf',
            name,
            type: 'text',
        });
    case 'categorical':
        return {
            _id: 'CatSlot',
            projectId: 'bf',
            name,
            type: 'categorical',
            categories: ['blue', 'red', 'orange', 'yellow'],
        };
    case 'bool':
        return {
            _id: 'BoolSlot',
            projectId: 'bf',
            name,
            type: 'bool',
        };
    case 'float':
        return {
            _id: 'FloatSlot',
            projectId: 'bf',
            name,
            type: 'float',
        };
    default:
        return {
            _id: 'DefaultSlot',
            projectId: 'bf',
            name,
            type: 'unfeaturized',
        };
    }
};

Cypress.Commands.add('meteorAddSlot', (name, type) => {
    const slotData = getSlotData(name, type);
    cy.MeteorCall('slots.insert', [slotData, 'bf']);
});
