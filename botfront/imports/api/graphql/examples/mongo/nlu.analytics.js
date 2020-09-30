import Model from '../examples.model';

export const getIntentDistribution = async id => Model.aggregate([
    {
        $match: {
            _id: id,
        },
    },
    {
        $group: {
            _id: '$intent',
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
]).allowDiskUse(true);

export const getEntityDistribution = async id => Model.aggregate([
    {
        $match: {
            _id: id,
        },
    },
    {
        $unwind: {
            path: '$entities',
        },
    },
    {
        $group: {
            _id: '$entities.entity',
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
]).allowDiskUse(true);
