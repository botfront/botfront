import Conversations from '../conversations.model';
import { generateBuckets } from '../../utils';

export const getResponseCounts = async ({
    projectId,
    envs,
    from = new Date().getTime() - (86400 * 7),
    to = new Date().getTime(),
    nBuckets,
    responses,
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
        $unwind: {
            path: '$tracker.events',
        },
    },
    {
        $match: {
            $and: [
                { 'tracker.events.event': 'action' },
                { 'tracker.events.name': { $regex: /^utter_/ } },
            ],
        },
    },
    {
        $addFields: {
            bucket: {
                $switch: {
                    branches: generateBuckets(from, to, '$tracker.events.timestamp', nBuckets),
                    default: 'bad_timestamp',
                },
            },
        },
    },
    {
        $match: { bucket: { $ne: 'bad_timestamp' } },
    },
    {
        $group: {
            _id: '$bucket',
            total: {
                $sum: 1,
            },
            count: {
                $sum: {
                    $cond: {
                        if: { $in: ['$tracker.events.name', responses] },
                        then: 1,
                        else: 0,
                    },
                },
            },
        },
    },
    {
        $addFields: {
            proportion: {
                $divide: [
                    {
                        $subtract: [
                            { $multiply: [{ $divide: ['$count', '$total'] }, 10000] },
                            { $mod: [{ $multiply: [{ $divide: ['$count', '$total'] }, 10000] }, 1] },
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
            total: '$total',
            proportion: '$proportion',
        },
    },
    { $sort: { bucket: 1 } },
]);
