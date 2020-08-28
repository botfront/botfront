import Examples from '../examples.model.js';

export const getIntentStatistics = async ({ projectId }) => Examples.aggregate([
    {
        $match: { projectId },
    },
    {
        $sort: { 'metadata.canonical': -1 },
    },
    {
        $group: {
            _id: {
                intent: '$intent',
                language: '$metadata.language',
            },
            count: { $sum: 1 },
            example: {
                $first: {
                    text: '$text',
                    canonical: '$metadata.canonical',
                },
            },
        },
    },
    {
        $group: {
            _id: '$_id.intent',
            languages: {
                $push: {
                    language: '$_id.language',
                    count: '$count',
                    example: '$example',
                },
            },
        },
    },
    {
        $project: {
            intent: '$_id',
            _id: false,
            languages: 1,
        },
    },
    { $sort: { intent: 1 } },
]).allowDiskUse(true);
