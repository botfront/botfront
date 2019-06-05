import SimpleSchema from 'simpl-schema';

export const StorySchema = new SimpleSchema(
    {
        name: { type: String },
        projectId: { type: String },
        stories: {
            type: Array,
        },
        'stories.$': {
            type: String,
        },
        createdAt: {
            type: Date,
            optional: true,
        },
        updatedAt: {
            type: Date,
            optional: true,
            autoValue: () => new Date(),
        },
    },
    { tracker: Tracker },
);
