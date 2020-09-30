const uuidv4 = require('uuid/v4');

const createGraphElements = (slots) =>  (Array.isArray(slots) ? slots : [])
    .reduce((acc, slot, i) => {
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
                    filling: filling.length > 0 ? filling : [{ type: 'from_entity' }],
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
    }, [{
        id: '1',
        data: { type: 'start' },
        position: { x: 200, y: 200 },
        type: 'start',
        className: 'start-node',
    }])

const getSafeName = (groups)=> {
    const groupNames = groups.map(({ name }) => name);
    let safeName = 'forms';
    
    const index = 1;
    while (groupNames.includes(safeName)) {
        safeName = `forms ${index}`;
    }
    return safeName
}

exports.migrateForms = (oldForms, storyGroups) => {
    let formMigrationGroup;

    const forms = oldForms.map((oldForm) => {
        const form = { ...oldForm }
        let { groupId } = form;
        // if the form has graph_elements it was migrated previously
        if (form.graph_elements && form.graph_elements.length > 0) return form;
        // eslint-disable-next-line camelcase
        form.graph_elements =  createGraphElements(form.slots)
        
        // add the form to a group
        if (!formMigrationGroup) {
            formMigrationGroup = {
                _id: uuidv4(),
                projectId: form.projectId,
                children: [],
                isExpanded: true,
                pinned: false,
                selected: false,
                name: getSafeName(storyGroups),
            };
        }
        groupId = formMigrationGroup._id;
        formMigrationGroup.children.push(form._id);
        form.groupId = groupId;
        return form
    });

    return { forms, formMigrationGroup };
}
