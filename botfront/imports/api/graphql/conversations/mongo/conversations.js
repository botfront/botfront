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


const createFilterObject = (projectId, status = [], env = 'development') => {
    const filters = { projectId };
    if (status.length > 0) filters.status = { $in: status };
    if (env) filters.env = env;
    if (env === 'development') {
        filters.env = { $in: ['development', null] };
    }
    return filters;
};

export const getConversations = async (projectId, page = 1, pageSize = 20, status = [], sort = null, env = 'development') => {
    const filtersObject = createFilterObject(projectId, status, env);
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
