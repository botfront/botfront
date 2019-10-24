import Conversations from '../conversations.model';

export const getConversationLengths = async ({
    projectId,
    from,
    to = new Date().getTime(),
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
    { $limit: 10 },
]);
