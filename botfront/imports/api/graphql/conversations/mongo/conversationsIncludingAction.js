import Conversations from '../conversations.model';
import { generateBuckets, fillInEmptyBuckets } from '../../utils';
import { trackerDateRangeStage } from './utils';

export const getConversationsIncludingAction = async ({
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
    ...trackerDateRangeStage(from, to),
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
            hits: {
                $min: [
                    1,
                    {
                        $size: {
                            $filter: {
                                input: '$tracker.events',
                                as: 'event',
                                cond: {
                                    $and: [
                                        { $eq: ['$$event.event', 'action'] },
                                        { $in: ['$$event.name', include] },
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
            hits: {
                $sum: '$hits',
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
            count: '$count',
            hits: '$hits',
            proportion: '$proportion',
        },
    },
    { $sort: { bucket: 1 } },
]).allowDiskUse(true), from, to, nBuckets);
