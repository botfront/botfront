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

const EventListenersSchema = new SimpleSchema({
    selector: { type: String, trim: true },
    event: { type: String, trim: true },
});

const QueryStringSchema = new SimpleSchema({
    param: { type: String, trim: true },
    value: { type: String, trim: true },
});

const TriggerSchema = new SimpleSchema({
    url: { type: Array, optional: true },
    'url.$': { type: String },
    timeOnPage: { type: Number, optional: true },
    numberOfVisits: { type: String, optional: true },
    numberOfPageVisits: { type: String, optional: true },
    device: { type: String, optional: true },
    queryString: { type: Array, optional: true },
    'queryString.$': { type: QueryStringSchema, optional: true },
    eventListeners: { type: Array, optional: true },
    'eventListeners.$': { type: EventListenersSchema, optional: true },
});

export const RulesSchema = new SimpleSchema({
    payload: { type: String, trim: true },
    text: { type: String, optional: true },
    trigger: {
        type: TriggerSchema,
        optional: true,
    },
});

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
    events: { type: Array, optional: true },
    'events.$': { type: String },
    branches: { type: Array, defaultValue: [] },
    'branches.$': { type: intermediateSchemas[intermediateSchemas.length - 1][1] },
    storyGroupId: {
        type: String,
    },
    projectId: { type: String },
    selected: { type: true, optional: true },
    checkpoints: { type: Array, optional: true },
    'checkpoints.$': { type: Array },
    'checkpoints.$.$': { type: String },
    rules: { type: Array, optional: true },
    'rules.$': { type: RulesSchema },
});
