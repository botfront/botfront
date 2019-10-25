import Conversations from '../conversations.model';
import { generateBuckets } from '../../utils';

export const getConversationCounts = async ({
    projectId,
    envs,
    from = new Date().getTime() - (86400 * 7),
    to = new Date().getTime(),
    nBuckets,
    exclude,
}) => Conversations.aggregate([
    {
        $match: {
            projectId,
            ...(envs ? { env: { $in: envs } } : {}),
        },
    },
    {
        $match: {
            $and: [
                {
                    'tracker.latest_event_time': {
                        $lt: to, // timestamp
                        $gte: from, // timestamp
                    },
                },
            ],
        },
    },
    {
        $addFields: {
            bucket: {
                $switch: {
                    branches: generateBuckets(from, to, '$tracker.latest_event_time', nBuckets),
                    default: 'bad_timestamp',
                },
            },
        },
    },
    {
        $match: { bucket: { $ne: 'bad_timestamp' } },
    },
    {
        $addFields: {
            engagements: {
                $min: [
                    1,
                    {
                        $size: {
                            $filter: {
                                input: '$tracker.events',
                                as: 'event',
                                cond: {
                                    $and: [
                                        { $eq: ['$$event.event', 'user'] },
                                        { $not: { $in: ['$$event.parse_data.intent.name', exclude] } },
                                    ],
                                },
                            },
                        },
                    },
                ],
            },
        },
    },
    {
        $group: {
            _id: '$bucket',
            count: {
                $sum: 1,
            },
            engagements: {
                $sum: '$engagements',
            },
        },
    },
    {
        $addFields: {
            proportion: {
                $divide: [
                    {
                        $subtract: [
                            { $multiply: [{ $divide: ['$engagements', '$count'] }, 10000] },
                            { $mod: [{ $multiply: [{ $divide: ['$engagements', '$count'] }, 10000] }, 1] },
                        ],
                    },
                    100,
                ],
            },
        },
    },
    {
        $project: {
            _id: null,
            bucket: '$_id',
            count: '$count',
            engagements: '$engagements',
            proportion: '$proportion',
        },
    },
    { $sort: { bucket: 1 } },
]);
