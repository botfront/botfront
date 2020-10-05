import SimpleSchema from 'simpl-schema';

const topLevelFields = {
    projectId: { type: String },
    storyGroupId: String,
    selected: { type: true, optional: true },
    textIndex: { type: Object, optional: true },
    'textIndex.info': { type: String, optional: true },
    'textIndex.contents': { type: String, optional: true },
    events: { type: Array, optional: true },
    'events.$': { type: String },
};

const commonFields = {
    story: {
        type: String,
        trim: false,
        optional: true,
    },
    title: {
        type: String,
        trim: true,
    },
    steps: {
        type: Array,
        defaultValue: [],
    },
    'steps.$': {
        type: Object,
        blackbox: true,
    },
};

const intermediateStorySchemas = [
    [
        { ...commonFields, _id: String },
        new SimpleSchema({ ...commonFields, _id: String }),
    ],
];
for (let i = 0; i < 100; i += 1) {
    const schemaShape = {
        ...intermediateStorySchemas[intermediateStorySchemas.length - 1][0],
        branches: { type: Array, optional: true },
        'branches.$': {
            type: intermediateStorySchemas[intermediateStorySchemas.length - 1][1],
        },
    };
    intermediateStorySchemas.push([schemaShape, new SimpleSchema(schemaShape)]);
}

export const StorySchema = new SimpleSchema({
    ...topLevelFields,
    ...commonFields,
    type: {
        type: String,
        allowedValues: ['story'],
    },
    branches: { type: Array, defaultValue: [] },
    'branches.$': {
        type: intermediateStorySchemas[intermediateStorySchemas.length - 1][1],
    },
    checkpoints: { type: Array, optional: true },
    'checkpoints.$': { type: Array },
    'checkpoints.$.$': { type: String },
});

export const RuleSchema = new SimpleSchema({
    ...topLevelFields,
    ...commonFields,
    type: {
        type: String,
        allowedValues: ['rule'],
    },
    conversation_start: { // default is false
        type: Boolean,
        optional: true,
    },
    wait_for_user_input: { // default is true
        type: Boolean,
        optional: true,
    },
    condition: {
        type: Array,
        defaultValue: [],
        optional: true,
    },
    'condition.$': {
        type: Object,
        blackbox: true,
    },
});
