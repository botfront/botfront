import SimpleSchema from 'simpl-schema';

export const StoryGroupSchema = new SimpleSchema(
    {
        name: { type: String },
        projectId: { type: String },
        createdAt: {
            type: Date,
            optional: true,
        },
        updatedAt: {
            type: Date,
            optional: true,
            autoValue: () => new Date(),
        },
        selected: { type: Boolean, defaultValue: false },
        smartGroup: { type: Object, blackbox: true, optional: true },
        children: { type: Array, defaultValue: [] },
        'children.$': String,
        isExpanded: { type: Boolean, defaultValue: true },
        pinned: { type: Boolean, defaultValue: false },
    },
    { tracker: Tracker },
);
