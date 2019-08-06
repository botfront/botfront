import SimpleSchema from 'simpl-schema';

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
    storyGroupId: {
        type: String,
    },
    projectId: { type: String },
    selected: { type: true, optional: true },
});
