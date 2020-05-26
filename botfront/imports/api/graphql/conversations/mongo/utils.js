export const dateRangeCondition = (from, to) => ([
    {
        $or: [
            { startTime: { $lte: from } },
            { startTime: { $lte: to } },
        ],
    },
    {
        $or: [
            { endTime: { $gte: from } },
            { endTime: { $gte: to } },
        ],
    },
]);

export const addFieldsForDateRange = () => ([{
    $addFields: {
        timingEvents: {
            $map: {
                input: {
                    $filter: {
                        input: '$tracker.events',
                        as: 'eventStep',
                        cond: {
                            $or: [
                                { $eq: ['$$eventStep.event', 'bot'] },
                                { $eq: ['$$eventStep.event', 'user'] },
                            ],
                        },
                    },
                },
                as: 'eventStepB',
                in: '$$eventStepB.timestamp',
            },
        },
    },
},
{
    $addFields: {
        startTime: {
            $arrayElemAt: ['$timingEvents', 0],
        },
        endTime: {
            $arrayElemAt: ['$timingEvents', -1],
        },
    },
}]);

export const trackerDateRangeStage = (from, to) => ([
    ...addFieldsForDateRange(),
    {
        $match: {
            $and: dateRangeCondition(from, to),
        },
    },
]);
