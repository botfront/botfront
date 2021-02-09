import Conversations from '../conversations.model';
import { generateBuckets, fillInEmptyBuckets } from '../../utils';
import { trackerDateRangeStage } from './utils';
import { getTriggerIntents } from '../../story/mongo/stories.js';
import { createEventsStep, categorizeEventFilters } from './eventFilter';

export const getConversationCounts = async ({
    projectId,
    envs,
    langs,
    from,
    to,
    nBuckets,
    userInitiatedConversations,
    triggerConversations,
    conversationLength,
    eventFilter,
    eventFilterOperator,
}) => {
    const intentsActionsStep = createEventsStep({ eventFilterOperator, eventFilter }, 'aggregation');
    const { excludedIntents = [] } = categorizeEventFilters(eventFilter);
    const conditions = [];
    const typeInclusion = [];
    const triggerIntents = await getTriggerIntents(projectId);

    if (!userInitiatedConversations) {
        typeInclusion.push({
            firstIntent: { $in: triggerIntents },
        });
    }
    if (!triggerConversations) {
        typeInclusion.push({
            firstIntent: {
                $not: {
                    $in: triggerIntents,
                },
            },
        });
    }
    return fillInEmptyBuckets(await Conversations.aggregate([
        {
            $match: {
                projectId,
                ...(envs ? { env: { $in: envs } } : {}),
                ...(langs && langs.length ? { language: { $in: langs } } : {}),
            },
        },
        ...trackerDateRangeStage(from, to),
        {
            $addFields: {
                bucket: {
                    $switch: {
                        branches: generateBuckets(from, to, '$endTime', nBuckets),
                        default: 'bad_timestamp',
                    },
                },
                firstIntent: {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: '$intents',
                                as: 'item',
                                cond: { $not: { $in: ['$$item', excludedIntents || []] } },
                            },
                        },
                        0,
                    ],
                },
                aboveMinLength: {
                    $gte: [
                        {
                            $size: {
                                $filter: {
                                    input: '$tracker.events',
                                    as: 'userEvents',
                                    cond: {
                                        $and: [
                                            { $eq: ['$$userEvents.event', 'user'] },
                                        ],
                                    },
                                },
                            },
                        },
                        conversationLength + 1, // conversation length is counted from the second utterance
                    ],
                },
            },
        },
        {
            $match: {
                $and: [
                    { bucket: { $ne: 'bad_timestamp' } },
                    { actions: { $type: 'array' } },
                    { intents: { $type: 'array' } },
                    ...(typeInclusion && typeInclusion.length ? [{ $and: typeInclusion }] : []),
                ],
            },
        },
        {
            $addFields: {
                hits: {
                    $min: [
                        1,
                        {
                            $switch: {
                                default: 0,
                                branches: [
                                    {
                                        case: {
                                            $and: [
                                                '$aboveMinLength',
                                                intentsActionsStep,
                                                ...conditions.map(conds => ({
                                                    $gte: [
                                                        {
                                                            $size: {
                                                                $filter: {
                                                                    input: '$tracker.events',
                                                                    as: 'event',
                                                                    cond: { $and: conds },
                                                                },
                                                            },
                                                        },
                                                        1,
                                                    ],
                                                })),
                                            ],
                                        },
                                        then: 1,
                                    },
                                ],
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
                hits: {
                    $sum: '$hits',
                },
            },
        },
        {
            $addFields: {
                proportion: {
                    $divide: [
                        {
                            $subtract: [
                                { $multiply: [{ $divide: ['$hits', '$count'] }, 10000] },
                                { $mod: [{ $multiply: [{ $divide: ['$hits', '$count'] }, 10000] }, 1] },
                            ],
                        },
                        100,
                    ],
                },
            },
        },
        {
            $project: {
                _id: null,
                bucket: '$_id',
                count: '$count',
                hits: '$hits',
                proportion: '$proportion',
            },
        },
        { $sort: { bucket: 1 } },
    ]).allowDiskUse(true), from, to, nBuckets);
};
