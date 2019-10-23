import Conversations from '../conversations.model';

const getExcludeClause = exclude => (
    (!exclude || !exclude.length)
        ? []
        : [{ intents: { $not: { $in: exclude } } }]
);

const getOnlyClause = only => (
    (!only || !only.length)
        ? []
        : [{ intents: { $in: only } }]
);

const getSliceParams = ({
    first, last, beg, end,
}) => {
    if (first) return [first];
    if (last) return [-last];
    if (beg && end) return [beg - 1, end - beg + 1];
    if (beg) return [beg - 1, 10000];
    if (end) return [end];
    return [];
};

export const getIntentFrequencies = async ({
    projectId,
    from,
    to = new Date().getTime(),
    only,
    exclude,
    first,
    last,
    beg,
    end,
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
                        $lt: to, // timestamp
                        $gte: from, // timestamp
                    },
                },
            ],
        },
    },
    {
        $project: {
            events: {
                $filter: {
                    input: '$tracker.events',
                    as: 'event',
                    cond: { $eq: ['$$event.event', 'user'] },
                },
            },
        },
    },
    ...((first || last || beg || end)
        ? [{
            $project: {
                events: {
                    $slice: ['$events', ...getSliceParams({
                        first, last, beg, end,
                    })],
                },
            },
        }]
        : []
    ),
    {
        $unwind: '$events',
    },
    {
        $project: {
            intents: '$events.parse_data.intent.name',
        },
    },
    {
        $match: {
            $and: [
                { intents: { $exists: true } },
                ...getExcludeClause(exclude),
                ...getOnlyClause(only),
            ],
        },
    },
    {
        $group: {
            _id: '$intents',
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
