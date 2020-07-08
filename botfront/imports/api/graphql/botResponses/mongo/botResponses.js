import { safeDump } from 'js-yaml/lib/js-yaml';
import shortid from 'shortid';
import { safeLoad } from 'js-yaml';
import BotResponses from '../botResponses.model';
import { clearTypenameField } from '../../../../lib/client.safe.utils';
import { Stories } from '../../../story/stories.collection';
import { addTemplateLanguage, modifyResponseType } from '../../../../lib/botResponse.utils';
import { parsePayload } from '../../../../lib/storyMd.utils';
import { replaceStoryLines } from '../../story/mongo/stories';

const indexResponseContent = (input) => {
    if (Array.isArray(input)) return input.reduce((acc, curr) => [...acc, ...indexResponseContent(curr)], []);
    if (typeof input === 'object') {
        let responseContent = [];
        Object.keys(input).forEach((key) => {
            if (typeof input[key] === 'string' && input[key].length > 0) {
                if (['text', 'title', 'subtitle', 'url'].includes(key)) responseContent.push(input[key].replace(/\n/, ' '));
                if (key === 'payload' && input[key][0] === '/') {
                    const { intent, entities } = parsePayload(input[key]);
                    responseContent.push(intent);
                    entities.forEach(entity => responseContent.push(entity));
                }
            } else if (!input[key]) {
                // pass on null values
            } else {
                responseContent = responseContent.concat(indexResponseContent(input[key]));
            }
        });
        return responseContent;
    }
    return [];
};

export const indexBotResponse = (response) => {
    let responseContent = [];
    responseContent.push(response.key);
    response.values.forEach((value) => {
        value.sequence.forEach((sequence) => {
            responseContent = [...responseContent, ...indexResponseContent(safeLoad(sequence.content))];
        });
    });
    return responseContent.join('\n');
};

const mergeAndIndexBotResponse = async ({
    projectId, language, key, newPayload, index,
}) => {
    const botResponse = await BotResponses.findOne({ projectId, key }).lean();
    if (!botResponse) {
        const textIndex = [key, ...indexResponseContent(newPayload)].join('\n');
        return textIndex;
    }
    const valueIndex = botResponse.values.findIndex(({ lang }) => lang === language);
    if (valueIndex > -1) { // add to existing language
        botResponse.values[valueIndex].sequence[index] = { content: safeDump(clearTypenameField(newPayload)) };
    } else { // add a new language
        botResponse.values = [...botResponse.values, { lang: language, sequence: [{ content: safeDump(clearTypenameField(newPayload)) }] }];
    }
    return indexBotResponse(botResponse);
};

export const createResponses = async (projectId, responses) => {
    const newResponses = typeof responses === 'string' ? JSON.parse(responses) : responses;
    // eslint-disable-next-line array-callback-return
    const answer = newResponses.map((newResponse) => {
        const properResponse = newResponse;
        properResponse.projectId = projectId;
        properResponse.textIndex = indexBotResponse(newResponse);
        return BotResponses.update({ projectId, key: newResponse.key }, properResponse, { upsert: true });
    });

    return Promise.all(answer);
};

const isResponseNameTaken = async(projectId, key, _id) => {
    if (!key || !projectId) return false;
    if (_id) return !!(await BotResponses.findOne({ projectId, key, _id: { $not: new RegExp(`^${_id}$`) } }).lean());
    return !!(await BotResponses.findOne({ projectId, key }).lean());
};

export const upsertFullResponse = async (projectId, _id, key, newResponse) => {
    const update = newResponse;
    const responseWithNameExists = await isResponseNameTaken(projectId, newResponse.key, _id);
    const textIndex = indexBotResponse(newResponse);
    delete update._id;
    let response = await BotResponses.findOneAndUpdate(
        { projectId, ...(_id ? { _id } : { key }) },
        {
            $set: { ...update, textIndex },
            $setOnInsert: {
                _id: shortid.generate(),
            },
        },
        { runValidators: true, upsert: true },
    ).exec();
    if (responseWithNameExists) {
        return response;
    }
    const oldKey = response ? response.key : key;
    // if response was inserted
    if (!response) {
        response = await BotResponses.findOne({ key: newResponse.key, projectId }).lean();
    }
    // if response was renamed
    if (!responseWithNameExists && oldKey && oldKey !== newResponse.key) {
        await replaceStoryLines(projectId, oldKey, newResponse.key);
    }
    return { ok: 1, _id: response._id };
};

export const createAndOverwriteResponses = async (projectId, responses) => Promise.all(
    responses.map(({ key, _id, ...rest }) => {
        const textIndex = indexBotResponse({ key, _id, ...rest });
        return BotResponses.findOneAndUpdate(
            { projectId, key }, {
                projectId, key, ...rest, textIndex,
            }, { new: true, lean: true, upsert: true },
        );
    }),
);

export const getBotResponses = async projectId => BotResponses.find({
    projectId,
}).lean();

export const deleteResponse = async (projectId, key) => BotResponses.findOneAndDelete({ projectId, key });

export const getBotResponse = async (projectId, key) => BotResponses.findOne({
    projectId,
    key,
}).lean();

export const getBotResponseById = async (_id) => {
    const botResponse = await BotResponses.findOne({
        _id,
    }).lean();
    return botResponse;
};

export const updateResponseType = async ({
    projectId, key, newResponseType, language,
}) => {
    const response = await BotResponses.findOne({ projectId, key }).lean();
    const result = await BotResponses.findOneAndUpdate(
        { projectId, key },
        {
            $set: { values: modifyResponseType(response, newResponseType, language, key).values },
            $setOnInsert: {
                _id: shortid.generate(),
                projectId,
                key,
            },
        },
        { upsert: true },
    );
    return result;
};

export const upsertResponse = async ({
    projectId, language, key, newPayload, index, newKey,
}) => {
    const textIndex = await mergeAndIndexBotResponse({
        projectId, language, key: newKey || key, newPayload, index,
    });
    const newNameIsTaken = await isResponseNameTaken(projectId, newKey);
    if (newNameIsTaken) throw new Error('E11000'); // response names must be unique
    const update = index === -1
        ? {
            $push: {
                'values.$.sequence': {
                    $each: [{ content: safeDump(clearTypenameField(newPayload)) }],
                },
            },
            $set: { textIndex, ...(newKey ? { key: newKey } : {}) },
        }
        : { $set: { [`values.$.sequence.${index}`]: { content: safeDump(clearTypenameField(newPayload)) }, textIndex, ...(newKey ? { key: newKey } : {}) } };
    const updatedResponse = await BotResponses.findOneAndUpdate(
        { projectId, key, 'values.lang': language },
        update,
        { new: true, lean: true },
    ).exec().then(result => (
        result
    || BotResponses.findOneAndUpdate(
        { projectId, key },
        {
            $push: { values: { lang: language, sequence: [{ content: safeDump(clearTypenameField(newPayload)) }] } },
            $setOnInsert: {
                _id: shortid.generate(),
                projectId,
                key: newKey || key,
                textIndex,
            },
        },
        { new: true, lean: true, upsert: true },
    )
    ));
    if (!newNameIsTaken && updatedResponse && newKey === updatedResponse.key) {
        await replaceStoryLines(projectId, key, newKey);
    }
    return updatedResponse;
};

export const deleteVariation = async ({
    projectId, language, key, index,
}) => {
    const responseMatch = await BotResponses.findOne(
        { projectId, key, 'values.lang': language },
    ).exec();
    const sequenceIndex = responseMatch && responseMatch.values.findIndex(({ lang }) => lang === language);

    const { sequence } = responseMatch.values[sequenceIndex];
    if (!sequence) return null;
    const updatedSequence = [...sequence.slice(0, index), ...sequence.slice(index + 1)];
    responseMatch.values[sequenceIndex].sequence = updatedSequence;
    const textIndex = indexBotResponse(responseMatch);
    return BotResponses.findOneAndUpdate(
        { projectId, key, 'values.lang': language },
        { $set: { 'values.$.sequence': updatedSequence, textIndex } },
        { new: true, lean: true },
    );
};

export const newGetBotResponses = async ({
    projectId, template, language, options = {},
}) => {
    const { emptyAsDefault } = options;
    // template (optional): str || array
    // language (optional): str || array
    let templateKey = {}; let languageKey = {}; let languageFilter = [];
    if (template) {
        const templateArray = typeof template === 'string' ? [template] : template;
        templateKey = { key: { $in: templateArray } };
    }
    if (language) {
        const languageArray = typeof language === 'string' ? [language] : language;
        languageKey = { 'values.lang': { $in: languageArray } };
        languageFilter = [{
            $addFields: { values: { $filter: { input: '$values', as: 'value', cond: { $in: ['$$value.lang', languageArray] } } } },
        }];
    }
    const aggregationParameters = [

        { $unwind: '$values' },
        { $unwind: '$values.sequence' },
        {
            $project: {
                _id: false,
                key: '$key',
                language: '$values.lang',
                channel: '$values.channel',
                payload: '$values.sequence.content',
                metadata: '$metadata',
            },
        },
    ];

    let templates = await BotResponses.aggregate([
        { $match: { projectId, ...templateKey, ...languageKey } },
        ...languageFilter,
        ...aggregationParameters,
    ]).allowDiskUse(true);

    if ((!templates || !templates.length > 0) && emptyAsDefault) {
        /* replace empty response content with default content
           of the correct response type
        */
        templates = await BotResponses.aggregate([
            { $match: { projectId, ...templateKey } },
            ...aggregationParameters,
        ]).allowDiskUse(true);
        templates = addTemplateLanguage(templates, language);
    }
    return templates;
};


export const deleteResponsesRemovedFromStories = (removedResponses, projectId) => {
    const sharedResponses = Stories.find({ projectId, events: { $in: removedResponses } }, { fields: { events: true } }).fetch();
    if (removedResponses && removedResponses.length > 0) {
        const deleteResponses = removedResponses.filter((event) => {
            if (!sharedResponses) return true;
            return !sharedResponses.find(({ events }) => events.includes(event));
        });
        deleteResponses.forEach(event => deleteResponse(projectId, event));
    }
};
