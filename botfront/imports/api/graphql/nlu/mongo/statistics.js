import Model from '../nlu.model';

export const getIntentStatistics = async ids => Model.aggregate([
    {
        $match: { _id: { $in: ids } },
    },
    {
        $unwind: { path: '$training_data.common_examples' },
    },
    {
        $sort: { 'training_data.common_examples.canonical': -1 },
    },
    {
        $group: {
            _id: {
                intent: '$training_data.common_examples.intent',
                language: '$language',
            },
            count: { $sum: 1 },
            example: {
                $first: {
                    text: '$training_data.common_examples.text',
                    canonical: '$training_data.common_examples.canonical',
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
