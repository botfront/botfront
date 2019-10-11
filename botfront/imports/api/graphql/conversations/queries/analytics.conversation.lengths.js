import Conversations from '../conversations.model';

export const getConversationLengths = async (projectId, from = 0, to = new Date().getTime()) => Conversations.aggregate([
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
            frequency: { $divide: ['$data.count', '$total'] },
            count: '$data.count',
        },
    },

    { $sort: { frequency: -1 } },
    // { $limit : 100 }
]);
