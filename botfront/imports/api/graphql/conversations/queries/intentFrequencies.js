import Conversations from '../conversations.model';

const getExcludeClause = exclude => (
    (!exclude || !exclude.length)
        ? []
        : [{ $not: { $in: ['$$event.parse_data.intent.name', exclude] } }]
);

const getOnlyClause = only => (
    (!only || !only.length)
        ? []
        : [{ $in: ['$$event.parse_data.intent.name', only] }]
);

export const getIntentFrequencies = async ({
    projectId,
    from,
    to = new Date().getTime(),
    position,
    only,
    exclude,
}) => Conversations.aggregate([
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
                    cond: {
                        $and: [
                            { $eq: ['$$event.event', 'user'] },
                            ...getExcludeClause(exclude),
                            ...getOnlyClause(only),
                        ],
                    },
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
            intent: '$tracker.events.parse_data.intent.name',
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
