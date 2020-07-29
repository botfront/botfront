import moment from 'moment';
import Conversations from '../conversations.model.js';
import {
    addFieldsForDateRange, dateRangeCondition, addFirstIntentField, filterByFirstIntentType,
} from './utils';
import { reshapeSequence, countMatchesPerConversation } from './conversationsFunnel.js';

const createSortObject = (sort) => {
    let fieldName;
    let order;
    const sortObject = { };
    switch (sort) {
    case 'updatedAt_ASC':
        fieldName = 'updatedAt';
        order = 1;
        break;
    case 'updatedAt_DESC':
        fieldName = 'updatedAt';
        order = -1;
        break;
    default:
        return null;
    }
    sortObject[fieldName] = order;
    return sortObject;
};


const getComparaisonSymbol = (comparaisonString) => {
    let compare = {};
    switch (comparaisonString) {
    case 'greaterThan': compare = { mongo: '$gte', math: '>=' };
        break;
    case 'lessThan': compare = { mongo: '$lte', math: '<=' };
        break;
    case 'equals': compare = { mongo: '$eq', math: '===' };
        break;
    default:
        throw new Error(`Comparaison with ${comparaisonString} not supported`);
    }
    return compare;
};

const createIntentsActionsStep = ({
    intentsActionsOperator,
    intentsActionsFilters,
}) => {
    if (!intentsActionsFilters || intentsActionsFilters.length === 0 || intentsActionsOperator === 'inOrder') {
        return {};
    }
    const filters = {};
    const included = intentsActionsFilters.filter(intentAction => !intentAction.excluded).map(intentAction => intentAction.name);
    const excluded = intentsActionsFilters.filter(intentAction => intentAction.excluded).map(intentAction => intentAction.name);

    const includedActions = included.filter(intentAction => intentAction.startsWith('utter_') || intentAction.startsWith('action_'));
    const excludedActions = excluded.filter(intentAction => intentAction.startsWith('utter_') || intentAction.startsWith('action_'));

    const includedIntents = included.filter(intentAction => !intentAction.startsWith('utter_') && !intentAction.startsWith('action_'));
    const excludedIntents = excluded.filter(intentAction => !intentAction.startsWith('utter_') && !intentAction.startsWith('action_'));
    if (intentsActionsFilters && intentsActionsFilters.length > 0) {
        if (intentsActionsOperator === 'or') {
            filters.$or = [];
            if (includedActions.length > 0) {
                filters.$or.push({ actions: { $in: includedActions } });
            }
            if (includedIntents.length > 0) {
                filters.$or.push({ intents: { $in: includedIntents } });
            }
            if (excludedActions.length > 0) {
                filters.$or.push({ actions: { $nin: excludedActions } });
            }
            if (excludedIntents.length > 0) {
                filters.$or.push({ intents: { $nin: excludedIntents } });
            }
        } else if (intentsActionsOperator === 'and') {
            filters.$and = [];
            if (includedActions.length > 0) {
                filters.$and.push({ actions: { $all: includedActions } });
            }
            if (includedIntents.length > 0) {
                filters.$and.push({ intents: { $all: includedIntents } });
            }
            if (excludedIntents.length > 0 || excludedActions.length > 0) {
                let exclusions = [];
                if (excludedActions.length > 0) {
                    exclusions = exclusions.concat(excludedActions.map(action => ({ $in: [action, '$actions'] })));
                }
                if (excludedIntents.length > 0) {
                    exclusions = exclusions.concat(excludedIntents.map(intent => ({ $in: [intent, '$intents'] })));
                }
                filters.$and.push({
                    $expr: {
                        $not: [
                            {
                                $or: exclusions,
                            },
                        ],
                    },
                });
            }
        }
    }
    return filters;
};


const createMatchingSteps = ({
    intentsActionsOperator,
    intentsActionsFilters,
}) => {
    if (!intentsActionsFilters || intentsActionsFilters.length === 0 || intentsActionsOperator !== 'inOrder') {
        return [];
    }

    const reshapedSequence = reshapeSequence(intentsActionsFilters);
    const matchSteps = [
        {
            $addFields: {
                sequence: reshapedSequence,
                'tracker.events': { $concatArrays: ['$tracker.events', ['END']] },
            },
        },
        countMatchesPerConversation('$tracker.events'),
        // that part check the order of the elements in the sequence, and store then in a dedicated field if they match
       
        {
            $set: {
                matching: {
                    $filter: { input: '$matching', cond: { $ne: ['$$this', 'STOP'] } },
                },
            },
        },
        {
            $match: { matching: { $size: reshapedSequence.length } },
        },
    ];
    return matchSteps;
};


export const createFilterObject = ({
    projectId,
    status = [],
    env = 'development',
    confidenceFilter,
    xThanConfidence,
    startDate,
    endDate,
    userId,
}) => {
    const filters = { projectId };
    if (status.length > 0) filters.status = { $in: status };
    if (env) filters.env = env;
    if (env === 'development') {
        filters.env = { $in: ['development', null] };
    }
    if (xThanConfidence && confidenceFilter > 0) {
        const { mongo } = getComparaisonSymbol(xThanConfidence);
        filters.$or = [{
            $and: [
                { 'tracker.events.parse_data.intent': { $exists: true } },
                { 'tracker.events.parse_data.intent.confidence': { [mongo]: confidenceFilter } }],
        },
        {
            $and: [
                { 'tracker.events.confidence': { $exists: true } },
                { 'tracker.events.confidence': { [mongo]: confidenceFilter } }],
        }];
    }
   
    if (startDate && endDate) {
        filters.$and = dateRangeCondition(moment(startDate).unix(), moment(endDate).unix());
    }
    if (userId) {
        filters.userId = userId;
    }
    return filters;
};


export const getConversations = async ({
    projectId,
    page = 1,
    pageSize = 20,
    status = [],
    sort = null,
    env = 'development',
    lengthFilter = null,
    xThanLength = null,
    durationFilterLowerBound = null,
    durationFilterUpperBound = null,
    confidenceFilter = null,
    xThanConfidence = null,
    startDate = null,
    endDate = null,
    userId = null,
    intentsActionsOperator = 'or',
    intentsActionsFilters = null,
    userInitiatedConversations,
    triggeredConversations,
}) => {
    const filtersObject = createFilterObject({
        projectId,
        status,
        env,
        confidenceFilter,
        xThanConfidence,
        startDate,
        endDate,
        userId,
    });

   
    const intentsActionsStep = createIntentsActionsStep({
        intentsActionsOperator,
        intentsActionsFilters,
    });
 

    const sequenceMatchingSteps = createMatchingSteps({
        intentsActionsOperator,
        intentsActionsFilters,
    });

    const sortObject = createSortObject(sort);
    

    let lengthFilterStages = [];
    if (xThanLength && lengthFilter > 0) {
        const compareSymbol = getComparaisonSymbol(xThanLength);
        lengthFilterStages = [{
            $addFields:
            {
                convLen:
                {
                    [compareSymbol.mongo]: [
                        {
                            $subtract: [{
                                $size: {
                                    $filter: {
                                        input: '$tracker.events',
                                        as: 'event',
                                        cond: { $eq: ['$$event.event', 'user'] },
                                    },
                                },
                            }, 1],
                        },
                        lengthFilter],
                },
            },
        },
        {
            $match: { convLen: true },
        }];
    }
    let durationFilterSteps = [];
    if (durationFilterLowerBound > 0 || durationFilterUpperBound > 0) {
        let compareAggregationLowerBound = [];
        let compareAggregationUpperBound = [];
        if (durationFilterLowerBound > 0) {
            compareAggregationLowerBound = [{
                $match: {
                    difference: { $gte: durationFilterLowerBound },
                },
            }];
        }
        if (durationFilterUpperBound > 0) {
            compareAggregationUpperBound = [{
                $match: {
                    difference: { $lte: durationFilterUpperBound },
                },
            }];
        }
        durationFilterSteps = [
            {
                $addFields: {
                    difference: { $subtract: ['$endTime', '$startTime'] },
                },
            },
            ...compareAggregationLowerBound,
            ...compareAggregationUpperBound,
        ];
    }

    const pages = pageSize > -1 ? pageSize : 1;
    const boundedPageNb = Math.min(pages, page);
    const limit = pageSize > -1 ? [{ $limit: pageSize }] : [];
    const aggregation = [
        ...addFieldsForDateRange(),
        addFirstIntentField([], true),
        {
            $match: {
                $and: [
                    { ...filtersObject },
                    { ...intentsActionsStep },
                    (await filterByFirstIntentType(projectId, userInitiatedConversations, triggeredConversations)),
                ],
            },
        },
        ...lengthFilterStages,
        ...durationFilterSteps,
        ...sequenceMatchingSteps,
        {
            $sort: sortObject,
        },
        {
            $facet: {
                conversations: [
                    {
                        $skip: (boundedPageNb - 1) * pageSize,
                    },
                    ...limit,
                ],
                pages: [
                    {
                        $count: 'numberOfDocuments',
                    },
                ],
            },
        },
    ];
    const paginatedResults = await Conversations.aggregate(aggregation).allowDiskUse(true);
    if (paginatedResults[0].conversations.length < 1) {
        return ({
            conversations: [],
            pages: 0,
        });
    }
    return ({
        conversations: paginatedResults[0].conversations,
        pages: pageSize > -1 ? Math.ceil(paginatedResults[0].pages[0].numberOfDocuments / pageSize) : 1,
    });
};


export const getConversation = async (projectId, id) => (Conversations.findOne(
    {
        projectId,
        _id: id,
    },
).lean());


export const getIntents = async (projectId) => {
    const intentsOfConversation = await Conversations.find(
        {
            projectId,
        }, 'intents',
    ).lean();
    
    const intents = intentsOfConversation.map(conversation => conversation.intents);
    return Array.from(new Set(intents.flat()));
};

export const updateConversationStatus = async (id, status) => (
    Conversations.updateOne({ _id: id }, { $set: { status } }).exec()
);

export const deleteConversation = async id => (
    Conversations.deleteOne({ _id: id }).exec()
);
