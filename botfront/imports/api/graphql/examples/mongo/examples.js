import shortid from 'shortid';
import { escapeRegExp } from 'lodash';
import Examples from '../examples.model.js';

const createSortObject = (fieldName = 'intent', order = 'ASC') => {
    const orderMongo = order === 'ASC' ? 1 : -1;
    const sortObject = { [fieldName]: orderMongo };
    return sortObject;
};

const createFilterObject = (
    projectId,
    language,
    intents,
    entities,
    onlyCanonicals,
    text,
    options = {},
) => {
    const filters = { projectId };
    const { exactMatch } = options;
    filters['metadata.language'] = language;

    if (intents && intents.length > 0) {
        filters.intent = {
            $in: intents,
        };
    }
    if (!exactMatch && entities && entities.length > 0) {
        filters['entities.entity'] = {
            $in: entities,
        };
    }
    if (exactMatch) {
        filters.entities = {
            // perfect match of entity payload if entities is array of { entity, value }
            $size: entities.length,
            $and: entities.map(({ entity, value }) => ({
                $elemMatch: { entity, value },
            })),
        };
    }
    if (onlyCanonicals) {
        filters['metadata.canonical'] = true;
    }
    if (text && text.length > 0) {
        filters.text = { $regex: new RegExp(escapeRegExp(text), 'i') };
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
    order = undefined,
    sortKey = undefined,
    cursor = undefined,
    options = {},
}) => {
    const filtersObject = createFilterObject(
        projectId,
        language,
        intents,
        entities,
        onlyCanonicals,
        text,
        options,
    );
    const sortObject = createSortObject(sortKey, order);

    const numberOfDocuments = await Examples.countDocuments({
        ...filtersObject,
    })
        .lean()
        .exec();

    const pagesNb = pageSize > -1 ? Math.ceil(numberOfDocuments / pageSize) : 1;
    const boundedPageNb = Math.min(pagesNb, cursor);
    const limit = pageSize > -1 ? { limit: pageSize } : {};
    const data = await Examples.find(
        {
            ...filtersObject,
        },
        null,
        {
            skip: (boundedPageNb - 1) * pageSize,
            ...limit,
            sort: sortObject,
        },
    ).lean();

    const cursorIndex = !cursor
        ? 0
        : data.findIndex(activity => activity._id === cursor) + 1;
    const examples = pageSize === 0 ? data : data.slice(cursorIndex, cursorIndex + pageSize);

    return {
        examples,
        pageInfo: {
            endCursor: examples.length ? examples[examples.length - 1]._id : '',
            hasNextPage: cursorIndex + pageSize < data.length,
        },
    };
};

export const listIntents = async ({ projectId, language }) => {
    const examples = await Examples.find({ projectId, 'metadata.language': language })
        .select({ intent: 1 })
        .lean();
    const intentsList = examples.map(example => example.intent);
    const intentsSet = new Set(intentsList);
    return Array.from(intentsSet);
};

export const listEntities = async ({ projectId, language }) => {
    const examples = await Examples.find({ projectId, 'metadata.language': language })
        .select({ entities: 1 })
        .lean();
    const entitiesList = examples
        .map(example => example.entities.map(entity => entity.entity))
        .flat();
    const entitiesSet = new Set(entitiesList);
    return Array.from(entitiesSet);
};

export const insertExamples = async ({ examples, language, projectId }) => {
    const preparedExamples = examples.map(example => ({
        ...example,
        projectId,
        metadata: { ...(example.metadata || {}), ...(language ? { language } : {}) },
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: shortid.generate(),
    }));
    try {
        const result = await Examples.insertMany(preparedExamples);
        if (result.length !== examples.length) {
            throw new Error('Insert failed');
        }
        return { success: true };
    } catch (e) {
        return { success: false };
    }
};

export const updateExample = async ({ id, example }) => {
    try {
        const result = await Examples.updateOne(
            { _id: id },
            { $set: { ...example, updatedAt: new Date() } },
        ).exec();
        if (result.nModified === 0 || result.ok === 0) {
            throw new Error('Update failed');
        }
        return { success: true, _id: id };
    } catch (e) {
        return { success: false, _id: id };
    }
};

export const deleteExamples = async ({ ids }) => {
    try {
        const result = await Examples.deleteMany({ _id: { $in: ids } }).exec();
        if (result.deletedCount !== ids.length) {
            throw new Error('Issue during delete');
        }
        return { success: true };
    } catch (e) {
        return { success: false };
    }
};
