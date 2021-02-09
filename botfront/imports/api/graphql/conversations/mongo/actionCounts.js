import Conversations from '../conversations.model';
import { generateBuckets, fillInEmptyBuckets } from '../../utils';
import { trackerDateRangeStage } from './utils';

export const getActionCounts = async ({
    projectId,
    envs,
    langs,
    from = new Date().getTime() - (86400 * 7),
    to = new Date().getTime(),
    nBuckets,
    include,
    exclude,
}) => fillInEmptyBuckets(await Conversations.aggregate([
    {
        $match: {
            projectId,
            ...(envs ? { env: { $in: envs } } : {}),
            ...(langs && langs.length ? { language: { $in: langs } } : {}),
        },
    },
    ...trackerDateRangeStage(from, to),
    {
        $unwind: {
            path: '$tracker.events',
        },
    },
    {
        $match: {
            $and: [
                { 'tracker.events.event': 'action' },
            ],
        },
    },
    {
        $addFields: {
            bucket: {
                $switch: {
                    branches: generateBuckets(from, to, '$endTime', nBuckets),
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
                                ...(include && include.length ? [{ $in: ['$tracker.events.name', include] }] : []),
                                ...(exclude && exclude.length ? [{ $not: { $in: ['$tracker.events.name', exclude] } }] : []),
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
]).allowDiskUse(true), from, to, nBuckets);
