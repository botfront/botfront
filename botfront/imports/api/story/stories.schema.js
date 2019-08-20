import SimpleSchema from 'simpl-schema';
import shortid from 'shortid';

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
        autoValue: () => shortid.generate(),
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
    branches: {
        type: Array,
        defaultValue: [
            {
                title: 'bleh',
            },
            {
                title: 'boo',
                branches: [
                    {
                        title: 'branch1',
                    },
                    {
                        title: 'branch2',
                        branches: [
                            {
                                title: 'brancha',
                            },
                            {
                                title: 'branchb',
                            },
                            {
                                title: 'branchc',
                            },
                        ],
                    },
                    {
                        title: 'branch3',
                    },
                ],
            },
            {
                title: 'bah',
            },
            {
                title: 'hurk',
            },
            {
                title: 'hlargh',
            },
        ],
    },
    'branches.$': { type: intermediateSchemas[intermediateSchemas.length - 1][1] },
    storyGroupId: {
        type: String,
    },
    projectId: { type: String },
    selected: { type: true, optional: true },
});
