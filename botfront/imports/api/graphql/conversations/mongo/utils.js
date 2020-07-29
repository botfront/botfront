import { getTriggerIntents } from '../../story/mongo/stories';

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

export const addFirstIntentField = (excludeIntents, addFields) => {
    const aggregation = {
        firstIntent: {
            $arrayElemAt: [
                {
                    $filter: {
                        input: '$intents',
                        as: 'item',
                        cond: { $not: { $in: ['$$item', excludeIntents || []] } },
                    },
                },
                0,
            ],
        },
    };
    if (addFields) {
        return { $addFields: { ...aggregation } };
    }
    return aggregation;
};

export const filterByFirstIntentType = async (projectId, userInitiated, triggered) => {
    const filters = [];
    const triggerIntents = await getTriggerIntents(projectId) || [];
    if (triggered !== true && triggerIntents) {
        filters.push({
            firstIntent: {
                $nin: triggerIntents,
            },
        });
    }
    if (userInitiated !== true && triggerIntents) {
        filters.push({
            firstIntent: {
                $in: triggerIntents,
            },
        });
    }
    return filters.length ? { $and: filters } : {};
};
