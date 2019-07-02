import SimpleSchema from 'simpl-schema';

export const StorySchema = new SimpleSchema({
    story: {
        type: String,
        trim: false,
    },
    title: {
        type: String,
    },
    storyGroupId: {
        type: String,
    },
    projectId: { type: String },
});
