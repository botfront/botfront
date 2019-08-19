import Conversations from './conversations.model';

export const getIntentsFrequencies = async (
    projectId,
    from = 0,
    to = new Date().getTime(),
    position = 1,
) => Conversations.aggregate([
    {
        $match: {
            projectId,
        },
    },
    {
        $match: {
            $and: [
                {
                    'tracker.latest_event_time': {
                        $lte: to, // timestamp
                        $gte: from, // timestamp
                    },
                },
            ],
        },
    },
    {
        $project: {
            'tracker.events': {
                $filter: {
                    input: '$tracker.events',
                    as: 'event',
                    cond: { $and: [{ $eq: ['$$event.event', 'user'] }] },
                },
            },
        },
    },
    {
        $project: {
            'tracker.events': { $arrayElemAt: ['$tracker.events', position] },
        },
    },
    {
        $project: {
            intent: '$tracker.events.parse_data.original_data.intent.name',
        },
    },
    {
        $match: {
            intent: { $exists: true },
        },
    },
    {
        $group: {
            _id: '$intent',
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
            name: '$data._id',
            frequency: { $divide: ['$data.count', '$total'] },
            count: '$data.count',
        },
    },

    { $sort: { count: -1 } },
]);
