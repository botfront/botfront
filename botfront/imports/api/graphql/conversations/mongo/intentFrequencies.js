import Conversations from '../conversations.model';
import { trackerDateRangeStage } from './utils';
import { getTriggerIntents } from '../../story/mongo/stories';

export const includeIntentsClause = only => (
    (!only || !only.length)
        ? []
        : [{ intents: { $in: only } }]
);

export const excludeIntentsClause = exclude => (
    (!exclude || !exclude.length)
        ? []
        : [{ intents: { $not: { $in: exclude } } }]
);

export const getSliceParams = ({
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
    envs,
    langs,
    from,
    to = new Date().getTime(),
    only = [],
    exclude = [],
    first,
    last,
    beg,
    end,
    limit,
}) => {
    const result = await Conversations.aggregate([
        {
            $match: {
                projectId,
                ...(envs ? { env: { $in: envs } } : {}),
                ...(langs && langs.length ? { language: { $in: langs } } : {}),
            },
        },
        ...trackerDateRangeStage(from, to),
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
                intents: { $ifNull: ['$events.parse_data.intent.name', 'No intent'] },
            },
        },
        {
            $match: {
                $and: [
                    { intents: { $exists: true } },
                    ...excludeIntentsClause(exclude),
                    ...includeIntentsClause(only),
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
        { $sort: { count: -1 } },
        ...(limit && limit !== -1 ? [{ $limit: limit }] : []),
    ]).allowDiskUse(true);
    return result;
};

export const getTriggerFrequencies = async ({
    projectId,
    ...args
}) => {
    const triggerIntentDictionary = await getTriggerIntents(projectId, { includeFields: { title: 1 } });
    const triggerIntents = Object.keys(triggerIntentDictionary);
    if (!triggerIntents || !triggerIntents.length) return [];
    const result = await getIntentFrequencies({
        ...args, projectId, only: triggerIntents, exclude: [], beg: 1,
    });
    return result.map(data => ({ ...data, name: triggerIntentDictionary[data.name].title }));
};

export const getUtteranceFrequencies = async ({
    projectId,
    exclude,
    ...args
}) => {
    const triggerIntents = await getTriggerIntents(projectId);
    const excludeIntentsAndTriggers = [...(exclude || []), ...triggerIntents];
    return getIntentFrequencies({ ...args, projectId, exclude: excludeIntentsAndTriggers });
};
