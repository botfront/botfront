import Conversations from '../conversations.model';

const generateBucket = bounds => ({
    case: { $and: bounds },
    then: bounds[0].$gte[1].toString(),
});

const generateBuckets = (cuttoffs, variable) => {
    const buckets = [];
    cuttoffs.forEach((val, idx, array) => {
        const bounds = [{ $gte: [variable, val] }];
        if (idx + 1 !== array.length) {
            bounds.push({ $lt: [variable, array[idx + 1]] });
        }
        buckets.push(generateBucket(bounds));
    });
    buckets.unshift(generateBucket([
        { $gte: [variable, 0] },
        { $lt: [variable, cuttoffs[0]] },
    ]));
    return buckets;
};

export const getConversationDurations = async ({
    projectId,
    from,
    to = new Date().getTime(),
    cuttoffs,
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
        $unwind: {
            path: '$tracker.events',
        },
    },
    {
        $match: {
            $and: [{ 'tracker.events.event': 'user' }],
        },
    },
    {
        $group: {
            _id: '$tracker.sender_id',
            first: { $first: '$tracker.events' },
            end: { $first: '$tracker.latest_event_time' },
        },
    },
    {
        $project: {
            difference: { $subtract: ['$end', '$first.timestamp'] },
        },
    },
    {
        $project: {
            duration: {
                $switch: {
                    branches: generateBuckets(cuttoffs, '$difference'),
                    default: 'ha',
                },
            },
        },
    },
    {
        $group: {
            _id: '$duration',
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
            duration: { $toInt: '$data._id' },
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
    { $sort: { duration: 1 } },
]);
