import Conversations from './conversations.model';

export const getConversationDurations = async (
    projectId,
    from = 0,
    to = new Date().getTime(),
) => Conversations.aggregate([
    {
        $match: {
            projectId: 'RnbbKrctuBFQ7aC3T',
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
        $group: {
            _id: '$someField',
            _30: {
                $sum: { $cond: [{ $and: [{ $lt: ['$difference', 30] }] }, 1, 0] },
            },
            _60: {
                $sum: {
                    $cond: [
                        {
                            $and: [
                                { $gte: ['$difference', 30] },
                                { $lt: ['$difference', 60] },
                            ],
                        },
                        1,
                        0,
                    ],
                },
            },
            _90: {
                $sum: {
                    $cond: [
                        {
                            $and: [
                                { $gte: ['$difference', 60] },
                                { $lt: ['$difference', 90] },
                            ],
                        },
                        1,
                        0,
                    ],
                },
            },
            _120: {
                $sum: {
                    $cond: [
                        {
                            $and: [
                                { $gte: ['$difference', 90] },
                                { $lt: ['$difference', 120] },
                            ],
                        },
                        1,
                        0,
                    ],
                },
            },
            _180: {
                $sum: {
                    $cond: [
                        {
                            $and: [
                                { $gte: ['$difference', 120] },
                                { $lt: ['$difference', 180] },
                            ],
                        },
                        1,
                        0,
                    ],
                },
            },
            _180more: {
                $sum: { $cond: [{ $and: [{ $gte: ['$difference', 180] }] }, 1, 0] },
            },
        },
    },
    {
        $project: {
            _id: false,
            _30: '$_30',
            _30_60: '$_60',
            _60_90: '$_90',
            _90_120: '$_120',
            _120_180: '$_180',
            _180_: '$_180more',
        },
    },

    // { $sort : { frequency : -1} }
    // { $limit : 100 }
]);
