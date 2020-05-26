import Conversations from '../conversations.model';
import { trackerDateRangeStage } from './utils';

const generateBucket = bounds => ({
    case: { $and: bounds },
    then: bounds[0].$gte[1].toString(),
});

const generateBuckets = (cutoffs, variable) => {
    const buckets = [];
    cutoffs.forEach((val, idx, array) => {
        const bounds = [{ $gte: [variable, val] }];
        if (idx + 1 !== array.length) {
            bounds.push({ $lt: [variable, array[idx + 1]] });
        }

        buckets.push(generateBucket(bounds));
    });
    buckets.unshift(generateBucket([
        { $gte: [variable, 0] },
        { $lt: [variable, cutoffs[0]] },
    ]));
    return buckets;
};

export const getConversationDurations = async ({
    projectId,
    envs,
    langs,
    from,
    to = new Date().getTime(),
    cutoffs,
}) => Conversations.aggregate([
    {
        $match: {
            projectId,
            ...(envs ? { env: { $in: envs } } : {}),
            ...(langs && langs.length ? { language: { $in: langs } } : {}),
        },
    },
    ...trackerDateRangeStage(from, to),
    {
        $project: {
            difference: { $subtract: ['$endTime', '$startTime'] },
        },
    },
    {
        $project: {
            duration: {
                $switch: {
                    branches: generateBuckets(cutoffs, '$difference'),
                    default: 'bad_timestamp',
                },
            },
        },
    },
    {
        $match: { duration: { $ne: 'bad_timestamp' } },
    },
    {
        $group: {
            _id: '$duration',
            count: {
                $sum: 1,
            },
        },
    },
    {
        $group: {
            _id: null,
            total: { $sum: '$count' },
            data: { $push: '$$ROOT' },
        },
    },
    { $unwind: '$data' },
    {
        $project: {
            _id: false,
            duration: { $toInt: '$data._id' },
            frequency: {
                $divide: [
                    {
                        $subtract: [
                            { $multiply: [{ $divide: ['$data.count', '$total'] }, 10000] },
                            { $mod: [{ $multiply: [{ $divide: ['$data.count', '$total'] }, 10000] }, 1] },
                        ],
                    },
                    100,
                ],
            },
            count: '$data.count',
        },
    },
    { $sort: { duration: 1 } },
]).allowDiskUse(true);
