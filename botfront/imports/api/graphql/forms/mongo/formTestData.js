export const otherForm = {
    _id: 'a54d9ca0-1a5e-4681-8496-ed4cbb2eb325',
    name: 'other_form',
    projectId: 'bf',
    isExpanded: false,
    pinned: true,
    slots: [{ utter_on_new_valid_slot: false, name: 'used_slot_2', filling: [{ intent: [], not_intent: [], type: 'from_entity' }] }],
    collect_in_botfront: null,
    description: null,
    graph_elements: [{
        id: '1', data: { type: 'start' }, position: { x: 200, y: 200 }, type: 'start', className: 'start-node',
    }, {
        id: 'used_slot_2',
        data: {
            type: 'slot', slotName: 'used_slot_2', filling: [{ type: 'from_entity' }], validation: null,
        },
        position: { x: 120, y: 350 },
        type: 'slot',
        className: 'slot-node',
    }, {
        id: 'e1-used_slot_2', source: '1', target: 'used_slot_2', type: 'condition', arrowHeadType: 'arrowclosed', data: { condition: null },
    }],
};

export const testForm = {
    _id: '029362ec-e367-476e-863b-0d5d7c03f5b3',
    name: 'test_form',
    projectId: 'bf',
    isExpanded: false,
    pinned: true,
    slots: [
        { utter_on_new_valid_slot: false, name: 'test_slot_A', filling: [{ intent: [], not_intent: [], type: 'from_entity' }] },
        { utter_on_new_valid_slot: false, name: 'test_slot_B', filling: [{ intent: [], not_intent: [], type: 'from_entity' }] },
        { utter_on_new_valid_slot: false, name: 'used_slot', filling: [{ intent: [], not_intent: [], type: 'from_entity' }] },
        { utter_on_new_valid_slot: false, name: 'unused_slot', filling: [{ intent: [], not_intent: [], type: 'from_entity' }] },
    ],
    collect_in_botfront: null,
    description: null,
    graph_elements: [{
        id: '1', data: { type: 'start' }, position: { x: 200, y: 200 }, type: 'start', className: 'start-node',
    }, {
        id: 'test_slot_A',
        data: {
            type: 'slot', slotName: 'test_slot_A', filling: [{ type: 'from_entity' }], validation: null,
        },
        position: { x: 120, y: 350 },
        type: 'slot',
        className: 'slot-node',
    }, {
        id: 'e1-test_slot_A', source: '1', target: 'test_slot_A', type: 'condition', arrowHeadType: 'arrowclosed', data: { condition: null },
    }, {
        id: 'test_slot_B',
        data: {
            type: 'slot', slotName: 'test_slot_B', filling: [{ type: 'from_entity' }], validation: null,
        },
        position: { x: 120, y: 500 },
        type: 'slot',
        className: 'slot-node',
    }, {
        id: 'etest_slot_A-test_slot_B', source: 'test_slot_A', target: 'test_slot_B', type: 'condition', arrowHeadType: 'arrowclosed', data: { condition: null },
    }, {
        id: 'used_slot',
        data: {
            type: 'slot', slotName: 'used_slot', filling: [{ type: 'from_entity' }], validation: null,
        },
        position: { x: 120, y: 650 },
        type: 'slot',
        className: 'slot-node',
    }, {
        id: 'etest_slot_B-used_slot', source: 'test_slot_B', target: 'used_slot', type: 'condition', arrowHeadType: 'arrowclosed', data: { condition: null },
    }, {
        id: 'unused_slot',
        data: {
            type: 'slot', slotName: 'unused_slot', filling: [{ type: 'from_entity' }], validation: null,
        },
        position: { x: 120, y: 800 },
        type: 'slot',
        className: 'slot-node',
    }, {
        id: 'eused_slot-unused_slot', source: 'used_slot', target: 'unused_slot', type: 'condition', arrowHeadType: 'arrowclosed', data: { condition: null },
    }],
};

export const formUpdateData = {
    form: {
        _id: '029362ec-e367-476e-863b-0d5d7c03f5b3',
        name: 'test_form',
        projectId: 'bf',
        isExpanded: true,
        pinned: true,
        slots: [],
        collect_in_botfront: null,
        description: null,
        graph_elements: [{
            id: '1', data: { type: 'start' }, position: { x: 200, y: 200 }, type: 'start', className: 'start-node',
        }],
    },
};

export const slotStory = {
    _id: 'k9cLkyyf4psfTj67Q',
    story: '* get_started\n  - slot{"used_slot":true}',
    title: 'Slot story',
    storyGroupId: 'Zv5Nkv9McJnc56zjD',
    projectId: 'bf',
    events: [],
    status: 'published',
    textIndex: { contents: 'get_started \n used_slot', info: 'Slot story' },
    branches: [],
};
export const slots = [
    {
        _id: '3HHBdjtWkCrTuRpvA', name: 'test_slot_A', type: 'unfeaturized', projectId: 'bf',
    },
    {
        _id: 'BdzWzwvX9SrqxCtPT', name: 'test_slot_B', type: 'unfeaturized', projectId: 'bf',
    },
    {
        _id: 'MCndTa5vqvfgna7QL', type: 'bool', projectId: 'bf', name: 'used_slot',
    },
    {
        _id: 'mSjpPPpaKDNLA8tAs', type: 'unfeaturized', projectId: 'bf', name: 'used_slot_2',
    },
    {
        _id: 'ne6vT2CzXproj7T2i', type: 'bool', projectId: 'bf', name: 'unused_slot',
    },

];

export const expectedRemainingSlots = [
    {
        _id: 'MCndTa5vqvfgna7QL', type: 'bool', projectId: 'bf', name: 'used_slot',
    },
    {
        _id: 'mSjpPPpaKDNLA8tAs', type: 'unfeaturized', projectId: 'bf', name: 'used_slot_2',
    },
    {
        _id: 'ne6vT2CzXproj7T2i', type: 'bool', projectId: 'bf', name: 'unused_slot',
    },

];
