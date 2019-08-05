import Model from './nlu.model';

export const getIntentDistribution = async id => Model.aggregate([
    {
        $match: {
            _id: id,
        },
    },
    {
        $unwind: {
            path: '$training_data.common_examples',
        },
    },
    {
        $group: {
            _id: '$training_data.common_examples.intent',
            count: { $sum: 1 },
        },
    },
    {
        $project: {
            intent: '$_id',
            _id: false,
            count: 1,
        },
    },
    { $sort: { count: -1 } },
]);

export const getEntityDistribution = async id => Model.aggregate([
    {
        $match: {
            _id: id,
        },
    },
    {
        $unwind: {
            path: '$training_data.common_examples',
        },
    },
    {
        $unwind: {
            path: '$training_data.common_examples.entities',
        },
    },
    {
        $group: {
            _id: '$training_data.common_examples.entities.entity',
            count: { $sum: 1 },
        },
    },
    {
        $project: {
            entity: '$_id',
            _id: false,
            count: 1,
        },
    },
    { $sort: { count: -1 } },
]);
