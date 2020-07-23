import SimpleSchema from 'simpl-schema';

const commonStorySchema = {
    story: {
        type: String,
        trim: false,
        optional: true,
    },
    title: {
        type: String,
        trim: true,
    },
    _id: {
        type: String,
    },
};

const intermediateSchemas = [[commonStorySchema, new SimpleSchema(commonStorySchema)]];
for (let i = 0; i < 100; i += 1) {
    const schemaShape = {
        ...intermediateSchemas[intermediateSchemas.length - 1][0],
        branches: { type: Array, optional: true },
        'branches.$': { type: intermediateSchemas[intermediateSchemas.length - 1][1] },
    };
    intermediateSchemas.push([schemaShape, new SimpleSchema(schemaShape)]);
}

export const StorySchema = new SimpleSchema({
    story: {
        type: String,
        trim: false,
        optional: true,
    },
    title: {
        type: String,
        trim: true,
    },
    type: {
        type: String,
        optional: true,
    },
    events: { type: Array, optional: true },
    'events.$': { type: String },
    branches: { type: Array, defaultValue: [] },
    'branches.$': { type: intermediateSchemas[intermediateSchemas.length - 1][1] },
    storyGroupId: String,
    projectId: { type: String },
    selected: { type: true, optional: true },
    checkpoints: { type: Array, optional: true },
    'checkpoints.$': { type: Array },
    'checkpoints.$.$': { type: String },
    textIndex: { type: Object, optional: true },
    'textIndex.info': { type: String, optional: true },
    'textIndex.contents': { type: String, optional: true },
});
