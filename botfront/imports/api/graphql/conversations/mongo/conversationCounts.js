import Conversations from '../conversations.model';
import { generateBuckets, fillInEmptyBuckets } from '../../utils';

const intentInList = intentList => ({ $in: ['$$event.parse_data.intent.name', intentList] });
const actionInList = actionList => ({ $in: ['$$event.name', actionList] });
const isNonEmpty = array => array && array.length;

export const getConversationCounts = async ({
    projectId,
    envs,
    langs,
    from = new Date().getTime() - (86400 * 7),
    to = new Date().getTime(),
    nBuckets,
    includeIntents = [],
    excludeIntents = [],
    includeActions = [],
    excludeActions = [],
}) => {
    const conditions = [];
    if (isNonEmpty(includeIntents) || isNonEmpty(excludeIntents)) {
        const intentConditions = [{ $eq: ['$$event.event', 'user'] }];
        if (isNonEmpty(includeIntents)) intentConditions.push(intentInList(includeIntents));
        if (isNonEmpty(excludeIntents)) intentConditions.push({ $not: intentInList(excludeIntents) });
        conditions.push(intentConditions);
    }
    if (isNonEmpty(includeActions) || isNonEmpty(excludeActions)) {
        const actionConditions = [{ $eq: ['$$event.event', 'action'] }];
        if (isNonEmpty(includeActions)) conditions.push(actionInList(includeActions));
        if (isNonEmpty(excludeActions)) conditions.push({ $not: actionInList(excludeActions) });
        conditions.push(actionConditions);
    }
    return fillInEmptyBuckets(await Conversations.aggregate([
        {
            $match: {
                projectId,
                ...(envs ? { env: { $in: envs } } : {}),
                ...(langs && langs.length ? { language: { $in: langs } } : {}),
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
                        branches: generateBuckets(from, to, '$tracker.latest_event_time', nBuckets),
                        default: 'bad_timestamp',
                    },
                },
            },
        },
        {
            $match: { bucket: { $ne: 'bad_timestamp' } },
        },
        {
            $addFields: {
                hits: {
                    $min: [
                        1,
                        ...conditions.map(conds => ({
                            $size: {
                                $filter: {
                                    input: '$tracker.events',
                                    as: 'event',
                                    cond: {
                                        $and: conds,
                                    },
                                },
                            },
                        })),
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
