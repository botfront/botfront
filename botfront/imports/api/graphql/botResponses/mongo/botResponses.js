import { safeDump } from 'js-yaml/lib/js-yaml';
import shortid from 'shortid';
import BotResponses from '../botResponses.model';
import { clearTypenameField } from '../../../../lib/utils';

export const createResponses = async (projectId, responses) => {
    const newResponses = typeof responses === 'string' ? JSON.parse(responses) : responses;

    // eslint-disable-next-line array-callback-return
    const answer = newResponses.map((newResponse) => {
        const properResponse = newResponse;
        properResponse.projectId = projectId;
        return BotResponses.update({ projectId, key: newResponse.key }, properResponse, { upsert: true });
    });

    return Promise.all(answer);
};

export const updateResponse = async (projectId, _id, newResponse) => BotResponses
    .updateOne({ projectId, _id }, newResponse).exec();

export const createResponse = async (projectId, newResponse) => BotResponses.create({
    ...clearTypenameField(newResponse),
    projectId,
});

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

export const upsertResponse = async ({
    projectId, language, key, newPayload,
}) => BotResponses.findOneAndUpdate(
    { projectId, key, 'values.lang': language },
    { $set: { 'values.$.sequence': [{ content: safeDump(clearTypenameField(newPayload)) }] } },
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

export const newGetBotResponses = async ({ projectId, template, language }) => {
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
    
    return BotResponses.aggregate([
        { $match: { projectId, ...templateKey, ...languageKey } },
        ...languageFilter,
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
    ]);
};
