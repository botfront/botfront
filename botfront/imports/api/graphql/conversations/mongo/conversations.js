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

const createFilterObject = (projectId, status) => {
    const filters = { projectId };
    if (status.length > 0) filters.status = { $in: status };
    return filters;
};

export const getConversations = async (projectId, page = 1, pageSize = 20, status = [], sort = null) => {
    const filtersObject = createFilterObject(projectId, status);
    const sortObject = createSortObject(sort);

    const numberOfDocuments = await Conversations.countDocuments({
        ...filtersObject,
    }).lean().exec();

    const pages = pageSize > -1 ? Math.ceil(numberOfDocuments / pageSize) : 1;
    const boundedPageNb = Math.min(pages, page);
    const limit = pageSize > -1 ? { limit: pageSize } : {};

    const conversations = await Conversations.find(
        {
            ...filtersObject,
        }, null,
        {
            skip: (boundedPageNb - 1) * pageSize,
            ...limit,
            sort: sortObject,
        },
    ).lean();

    return {
        conversations,
        pages,
    };
};


export const getConversation = async (projectId, id, senderId) => {
    if (senderId) {
        return Conversations.findOne(
            {
                projectId,
                'tracker.sender_id': senderId,
            },
        ).lean();
    }
    return Conversations.findOne({ projectId, _id: id }).lean();
};

export const updateConversationStatus = async (id, status) => (
    Conversations.updateOne({ _id: id }, { $set: { status } }).exec()
);

export const deleteConversation = async id => (
    Conversations.deleteOne({ _id: id }).exec()
);
