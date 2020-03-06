import SimpleSchema from 'simpl-schema';

export const StoryGroupSchema = new SimpleSchema(
    {
        title: { type: String },
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
        children: { type: Array, defaultValue: [] },
        'children.$': String,
        hasChildren: { type: Boolean, defaultValue: false },
        isExpanded: { type: Boolean, defaultValue: true },
        canBearChildren: { type: Boolean, autoValue: () => true },
        parentId: String,
    },
    { tracker: Tracker },
);
