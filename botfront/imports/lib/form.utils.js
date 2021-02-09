
export const createStartElement = position => ({
    id: '1', data: { type: 'start' }, position: position || { x: 200, y: 200 }, type: 'start', className: 'start-node',
});

export const generateGraphElementsFromSlots = slots => slots.reduce((acc, slot, i) => {
    const previousId = i === 0 ? '1' : slots[i - 1].name;
    const { name, filling, ...slotData } = slot;
    return [
        ...acc,
        {
            id: slot.name,
            data: {
                ...slotData,
                slotName: name,
                type: 'slot',
                filling: filling.length > 0 ? filling : [{ type: 'from_text' }],
            },
            position: { x: 120, y: 200 + (i + 1) * 150 },
            type: 'slot',
            className: 'slot-node',
        },
        {
            id: `e${previousId}-${slot.name}`,
            source: previousId,
            target: `${slot.name}`,
            animated: true,
            type: 'condition',
            arrowHeadType: 'arrowclosed',
            data: {
                condition: null,
            },
        },
    ];
}, [createStartElement()]);

export const getGraphElementsFromDomain = (domainGraphElements, slotData) => {
    // if the imported form does not have graph elements they need to be added
    if (!domainGraphElements) return generateGraphElementsFromSlots(slotData);
    
    const { edges = [], nodes = [] } = domainGraphElements;
    const slotDictionary = slotData.reduce((acc, slot) => (
        { ...acc, [slot.name]: slot }
    ), {});

    const graphElements = [];
    nodes.forEach((node, i) => {
        switch (node.type) {
        case 'start':
            graphElements.push(createStartElement(node.position));
            break;
        case 'slot':
            graphElements.push({
                id: node.id,
                data: {
                    type: node.type,
                    slotName: node.id,
                    filling: slotDictionary[node.id].filling,
                    validation: slotDictionary[node.id].validation,
                },
                position: node.position || { x: 120, y: 225 + (i * 150) },
                type: node.type,
                className: 'slot-node',
            });
            break;
        case 'slotSet':
            graphElements.push({
                id: node.id,
                data: {
                    type: node.type,
                    slotType: node.slotType,
                    slotName: node.slotName,
                    slotValue: node.slotValue,
                },
                position: node.position || { x: 120, y: 225 + (i * 150) },
                type: node.type,
                className: 'slot-set-node',
            });
            break;
        default:
        }
    });

    edges.forEach(({ condition, ...edge }) => {
        graphElements.push({
            ...edge,
            animated: true,
            arrowHeadType: 'arrowclosed',
            data: { condition },
        });
    });

    return graphElements;
};
