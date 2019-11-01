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

export const getConversations = async (projectId, skip = 0, limit = 20, status = [], sort = null) => {
    const filtersObject = createFilterObject(projectId, status);
    const sortObject = createSortObject(sort);


    return (Conversations.find(
        {
            ...filtersObject,
        }, null,
        {
            skip,
            limit,
            sort: sortObject,
        },
    ).lean());
};
