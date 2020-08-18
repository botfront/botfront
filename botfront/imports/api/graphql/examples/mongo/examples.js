import shortid from 'shortid';
import Examples from '../examples.model.js';

const createSortObject = (fieldName, order) => {
    const orderMongo = order === 'ASC' ? 1 : -1;
    const sortObject = { [fieldName]: orderMongo };
    return sortObject;
};

const createFilterObject = (projectId, language, intents, entities, onlyCanonicals, text) => {
    const filters = { projectId, language };

    if (intents && intents.length > 0) {
        filters.intent = {
            $in: intents,
        };
    }
    if (entities && entities.length > 0) {
        filters['entities.entity'] = {
            $in: entities,
        };
    }
    if (onlyCanonicals) {
        filters['metadata.canonical'] = true;
    }
    if (text && text.length > 0) {
        filters['entities.entity'] = {
            $in: entities,
        };
    }

    return filters;
};


export const getExamples = async ({
    projectId = '',
    pageSize = 20,
    language = '',
    intents = [],
    entities = [],
    text = '',
    onlyCanonicals = false,
    order = '',
    sortKey = '',
    cursor = '', // a generic name for the current page
}) => {
    const filtersObject = createFilterObject(projectId, language, intents, entities, onlyCanonicals, text);
    const sortObject = createSortObject(sortKey, order);

    const numberOfDocuments = await Examples.countDocuments({
        ...filtersObject,
    }).lean().exec();

    const pagesNb = pageSize > -1 ? Math.ceil(numberOfDocuments / pageSize) : 1;
    const boundedPageNb = Math.min(pagesNb, cursor);
    const limit = pageSize > -1 ? { limit: pageSize } : {};

    const examples = await Examples.find(
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
        examples,
        pages: {
            hasNextPage: pagesNb > cursor,
            endCursor: cursor + 1,
        },
    };
};


export const listIntents = async ({ projectId, language }) => {
    const examples = await Examples.find({ projectId, language }).select({ intent: 1 }).lean();
    const intentsList = examples.map(example => example.intent);
    const intentsSet = new Set(intentsList);
    return Array.from(intentsSet);
};

export const listEntities = async ({ projectId, language }) => {
    const examples = await Examples.find({ projectId, language }).select({ entities: 1 }).lean();
    const entitiesList = examples.map(example => example.entities.map(entity => entity)).flat();
    const entitiesSet = new Set(entitiesList);
    return Array.from(entitiesSet);
};

export const insertExamples = async ({ examples }) => {
    const preparedExamples = examples.map(example => ({
        ...example, createdAt: new Date(), updatedAt: new Date(), _id: shortid.generate(),
    }));
    try {
        await Examples.insertMany(preparedExamples);
        return preparedExamples;
    } catch (e) {
        // TODO error details
        return new Error('');
    }
};


export const updateExample = async ({ id, example }) => {
    try {
        const result = await Examples.updateOne({ _id: id }, { $set: { ...example, updatedAt: new Date() } }).exec();
        return result;
    } catch (e) {
        // TODO error details
        return new Error('');
    }
};


export const deleteExamples = async ({ ids }) => {
    try {
        const result = await Examples.deleteMany({ _id: { $in: ids } }).exec();
        return result;
    } catch (e) {
        // TODO error details
        return new Error('');
    }
};
