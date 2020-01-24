import Conversations from '../conversations.model';
import { generateBuckets, fillInEmptyBuckets } from '../../utils';

export const getActionCounts = async ({
    projectId,
    envs,
    langs,
    from = new Date().getTime() - (86400 * 7),
    to = new Date().getTime(),
    nBuckets,
    include,
}) => fillInEmptyBuckets(await Conversations.aggregate([
    {
        $match: {
            projectId,
            ...(envs ? { env: { $in: envs } } : {}),
            ...(langs && langs.length ? { language: { $in: langs } } : {}),
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
            count: {
                $sum: 1,
            },
            hits: {
                $sum: {
                    $cond: {
                        if: {
                            $and: [
                                { $eq: ['$tracker.events.event', 'action'] },
                                { $in: ['$tracker.events.name', include] },
                            ],
                        },
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
                            { $multiply: [{ $divide: ['$hits', '$count'] }, 10000] },
                            { $mod: [{ $multiply: [{ $divide: ['$hits', '$count'] }, 10000] }, 1] },
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
            hits: '$hits',
            count: '$count',
            proportion: '$proportion',
        },
    },
    { $sort: { bucket: 1 } },
]), from, to, nBuckets);
