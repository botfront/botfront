import SimpleSchema from 'simpl-schema';

import { validateYaml } from '../../lib/utils';

export const StorySchema = new SimpleSchema(
    {
        name: { type: String },
        projectId: { type: String },
        stories: {
            type: Array,
        },
        'stories.$': {
            type: String,
            custom: validateYaml,
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
