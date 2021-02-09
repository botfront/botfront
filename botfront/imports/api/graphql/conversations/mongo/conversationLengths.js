import Conversations from '../conversations.model';
import { trackerDateRangeStage } from './utils';

export const getConversationLengths = async ({
    projectId,
    envs,
    langs,
    from,
    to,
    limit,
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
        $unwind: {
            path: '$tracker.events',
        },
    },
    {
        $match: {
            $and: [
                { 'tracker.events.event': 'user' },
                // {"$tracker.events.parse_data.intent.confidence": {$ne: 1}},
            ],
        },
    },
    {
        $group: {
            _id: '$tracker.sender_id',
            length: {
                $sum: 1,
            },
        },
    },
    {
        $group: {
            _id: '$length',
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
            length: { $subtract: ['$data._id', 1] },
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

    { $sort: { length: 1 } },
    ...(limit && limit !== -1 ? [{ $limit: limit }] : []),
]).allowDiskUse(true);
