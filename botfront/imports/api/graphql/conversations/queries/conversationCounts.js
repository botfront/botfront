import Conversations from '../conversations.model';

const generateCuttoffs = (from, to, nBuckets) => {
    const delta = Math.abs(from - to);
    const bucketSize = (delta / nBuckets).toFixed(7);
    return Array.from(Array(nBuckets)).map((_e, i) => [
        from + i * bucketSize, i === nBuckets - 1 ? to : from + (i + 1) * bucketSize,
    ]);
};

const generateBuckets = (from, to, nBuckets) => (
    generateCuttoffs(from, to, nBuckets)
        .map(bounds => ({
            case: {
                $and: [
                    { $gte: ['$tracker.latest_event_time', bounds[0]] },
                    { $lt: ['$tracker.latest_event_time', bounds[1]] },
                ],
            },
            then: bounds[0].toFixed(0).toString(),
        }))
);

export const getConversationCounts = async ({
    projectId,
    from = new Date().getTime() - (86400 * 7),
    to = new Date().getTime(),
    nBuckets,
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
        $addFields: {
            bucket: {
                $switch: {
                    branches: generateBuckets(from, to, nBuckets),
                    default: 'hey',
                },
            },
        },
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
                                        { $not: { $in: ['$$event.parse_data.intent.name', ['get_started']] } },
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
                $divide: ['$engagements', '$count'],
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
