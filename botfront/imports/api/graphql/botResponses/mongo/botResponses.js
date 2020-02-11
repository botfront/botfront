import { safeDump, safeLoad } from 'js-yaml/lib/js-yaml';
import shortid from 'shortid';
import BotResponses from '../botResponses.model';
import { GlobalSettings } from '../../../globalSettings/globalSettings.collection';
import { clearTypenameField } from '../../../../lib/utils';
import { Stories } from '../../../story/stories.collection';
import { addTemplateLanguage } from '../../../../lib/botResponse.utils';

export const createResponses = async (projectId, responses) => {
    const newResponses = typeof responses === 'string' ? JSON.parse(responses) : responses;

    // eslint-disable-next-line array-callback-return
    const answer = newResponses.map((newResponse) => {
        const properResponse = newResponse;
        properResponse.projectId = projectId;
        return BotResponses.update({ projectId, key: newResponse.key }, properResponse, {
            upsert: true,
        });
    });

    return Promise.all(answer);
};

export const updateResponse = async (projectId, _id, newResponse) => BotResponses.updateOne({ projectId, _id }, newResponse, {
    runValidators: true,
}).exec();

export const createResponse = async (projectId, newResponse) => BotResponses.create({
    ...clearTypenameField(newResponse),
    projectId,
});

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

const getImageDeletionWebook = () => {
    const {
        settings: {
            private: { webhooks },
        },
    } = GlobalSettings.findOne({}, { fields: { 'settings.private.webhooks': 1 } });
    const {
        deleteImageWebhook: { url, method },
    } = webhooks;
    return { url, method };
};

const deleteImages = async (imgUrls, projectId, url, method) => {
    const result = await Promise.all(
        imgUrls.map(imageUrl => Meteor.callWithPromise('axios.requestWithJsonBody', url, method, {
            projectId,
            uri: imageUrl,
        })),
    );
    if (result.filter(r => ![204, 404].includes(r.status))) {
        // Right now, can't find way to get error all the way to client
        // but we can ignore since an error is not fatal
    }
};

export const deleteResponse = async (projectId, key) => {
    const response = await BotResponses.findOne({ projectId, key }).lean();
    if (!response) return;
    const { url, method } = getImageDeletionWebook();
    if (url && method) deleteImages(getImageUrls(response), projectId, url, method);
    return BotResponses.findOneAndDelete({ _id: response._id }); // eslint-disable-line consistent-return
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

export const upsertResponse = async ({
    projectId, language, key, newPayload, index,
}) => {
    const update = index === -1
        ? { $push: { 'values.$.sequence': { $each: [{ content: safeDump(clearTypenameField(newPayload)) }] } } }
        : { $set: { [`values.$.sequence.${index}`]: { content: safeDump(clearTypenameField(newPayload)) } } };
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
    const sequence = responseMatch && responseMatch.values.find(({ lang }) => lang === language).sequence;
    if (!sequence) return null;
    const updatedSequence = [...sequence.slice(0, index), ...sequence.slice(index + 1)];
    return BotResponses.findOneAndUpdate(
        { projectId, key, 'values.lang': language },
        { $set: { 'values.$.sequence': updatedSequence } },
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
    const sharedResponses = Stories.find(
        { events: { $in: removedResponses } },
        { fields: { events: true } },
    ).fetch();
    if (removedResponses && removedResponses.length > 0) {
        const deleteResponses = removedResponses.filter((event) => {
            if (!sharedResponses) return true;
            return !sharedResponses.find(({ events }) => events.includes(event));
        });
        deleteResponses.forEach(event => deleteResponse(projectId, event));
    }
};
