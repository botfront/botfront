import { safeDump, safeLoad } from 'js-yaml/lib/js-yaml';
import shortid from 'shortid';
import BotResponses from '../botResponses.model';
import { GlobalSettings } from '../../../globalSettings/globalSettings.collection';
import { clearTypenameField } from '../../../../lib/client.safe.utils';
import { Stories } from '../../../story/stories.collection';
import { addTemplateLanguage, modifyResponseType } from '../../../../lib/botResponse.utils';
import { parsePayload } from '../../../../lib/storyMd.utils';

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

export const updateResponse = async (projectId, _id, newResponse) => {
    const textIndex = indexBotResponse(newResponse);
    const result = BotResponses.updateOne(
        { projectId, _id },
        { ...newResponse, textIndex },
        { runValidators: true },
    ).exec();
    return result;
};


export const createResponse = async (projectId, newResponse) => {
    const textIndex = indexBotResponse(newResponse);
    return BotResponses.create({
        ...clearTypenameField(newResponse),
        projectId,
        textIndex,
    });
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

const getImageUrls = response => response.values.reduce(
    (vacc, vcurr) => [
        ...vacc,
        ...vcurr.sequence.reduce((sacc, scurr) => {
            const { image } = safeLoad(scurr.content);
            return image ? [...sacc, image] : [sacc];
        }, []),
    ],
    [],
);

export const getImageWebhooks = () => {
    const {
        settings: {
            private: { webhooks },
        },
    } = GlobalSettings.findOne({}, { fields: { 'settings.private.webhooks': 1 } });
    const { deleteImageWebhook, uploadImageWebhook } = webhooks;
    return { deleteImageWebhook, uploadImageWebhook };
};

export const deleteImages = async (imgUrls, projectId, url, method) => Promise.all(
    imgUrls.map(imageUrl => Meteor.callWithPromise('axios.requestWithJsonBody', url, method, {
        projectId,
        uri: imageUrl,
    })),
);

export const deleteResponse = async (projectId, key) => {
    const response = await BotResponses.findOne({ projectId, key }).lean();
    if (!response) return;
    const { deleteImageWebhook: { url, method } } = getImageWebhooks();
    if (url && method) deleteImages(getImageUrls(response), projectId, url, method);
    return BotResponses.findOneAndDelete({ _id: response._id }).lean(); // eslint-disable-line consistent-return
};

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
    projectId, language, key, newPayload, index,
}) => {
    const textIndex = await mergeAndIndexBotResponse({
        projectId, language, key, newPayload, index,
    });
    const update = index === -1
        ? { $push: { 'values.$.sequence': { $each: [{ content: safeDump(clearTypenameField(newPayload)) }] } }, $set: { textIndex } }
        : { $set: { [`values.$.sequence.${index}`]: { content: safeDump(clearTypenameField(newPayload)) }, textIndex } };
    return BotResponses.findOneAndUpdate(
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
                key,
                textIndex,
            },
        },
        { new: true, lean: true, upsert: true },
    )
    ));
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
    let templateKey = {};
    let languageKey = {};
    let languageFilter = [];
    if (template) {
        const templateArray = typeof template === 'string' ? [template] : template;
        templateKey = { key: { $in: templateArray } };
    }
    if (language) {
        const languageArray = typeof language === 'string' ? [language] : language;
        languageKey = { 'values.lang': { $in: languageArray } };
        languageFilter = [
            {
                $addFields: {
                    values: {
                        $filter: {
                            input: '$values',
                            as: 'value',
                            cond: { $in: ['$$value.lang', languageArray] },
                        },
                    },
                },
            },
        ];
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
