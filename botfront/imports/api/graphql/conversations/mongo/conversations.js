import Conversations from '../conversations.model.js';

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
    case 'greaterThan': compare = { mongo: '$gt', math: '>' };
        break;
    case 'lesserThan': compare = { mongo: '$lt', math: '<' };
        break;
    case 'equals': compare = { mongo: '$eq', math: '===' };
        break;
    default:
        throw new Error(`Comparaison with ${comparaisonString} not supported`);
    }
    return compare;
};
const createFilterObject = (
    projectId,
    status = [],
    env = 'development',
    lengthFilter,
    xThanLength,
    confidenceFilter,
    xThanConfidence,
    actionFilter,
) => {
    const filters = { projectId };
    if (status.length > 0) filters.status = { $in: status };
    if (env) filters.env = env;
    if (env === 'development') {
        filters.env = { $in: ['development', null] };
    }
    if (lengthFilter && xThanLength) {
        const { math } = getComparaisonSymbol(xThanLength);
        filters['tracker.events'] = { $exists: true };
        filters.$where = `this.tracker.events.length${math}${lengthFilter}`;
    }

    if (confidenceFilter && xThanConfidence) {
        const { mongo } = getComparaisonSymbol(xThanConfidence);
        filters['tracker.events.parse_data.intent.confidence'] = { [mongo]: confidenceFilter };
    }
    if (actionFilter) {
        filters['tracker.events.event'] = 'action';
        filters['tracker.events.name'] = { $in: actionFilter };
    }
    return filters;
};

export const getConversations = async (
    projectId,
    page = 1,
    pageSize = 20,
    status = [],
    sort = null,
    env = 'development',
    lengthFilter = null,
    xThanLength = null,
    confidenceFilter = null,
    xThanConfidence = null,
    actionFilter = null) => {
    const filtersObject = createFilterObject(
        projectId,
        status,
        env,
        lengthFilter,
        xThanLength,
        confidenceFilter,
        xThanConfidence,
        actionFilter,
    );
    const sortObject = createSortObject(sort);

    const numberOfDocuments = await Conversations.countDocuments({
        ...filtersObject,
    }).lean().exec();

    const pages = Math.ceil(numberOfDocuments / pageSize);
    const boundedPageNb = Math.min(pages, page);

    const conversations = await Conversations.find(
        {
            ...filtersObject,
        }, null,
        {
            skip: (boundedPageNb - 1) * pageSize,
            limit: pageSize,
            sort: sortObject,
        },
    ).lean();

    return {
        conversations,
        pages,
    };
};


export const getConversation = async (projectId, id) => (Conversations.findOne(
    {
        projectId,
        _id: id,
    },
).lean());

export const updateConversationStatus = async (id, status) => (
    Conversations.updateOne({ _id: id }, { $set: { status } }).exec()
);

export const deleteConversation = async id => (
    Conversations.deleteOne({ _id: id }).exec()
);
