import { safeDump as yamlDump, safeLoad as yamlLoad } from 'js-yaml';
import BotResponses from '../botResponses.model';

const formatNewlines = (sequence) => {
    const regexSpacedNewline = / {2}\n/g;
    const regexNewline = /\n/g;
    const updatedSequence = sequence.map(({ content: contentYaml }) => {
        const content = yamlLoad(contentYaml);
        if (content.text) {
            content.text = content.text
                .replace(regexSpacedNewline, '\n')
                .replace(regexNewline, '  \n');
        }
        return { content: yamlDump({ ...content }) };
    });
    return updatedSequence;
};

const formatTextOnSave = values => values.map((item) => {
    const updatedItem = item;
    updatedItem.sequence = formatNewlines(item.sequence);
    return updatedItem;
});

export const createResponses = async (projectId, responses) => {
    const newResponses = typeof responses === 'string' ? JSON.parse(responses) : responses;

    // eslint-disable-next-line array-callback-return
    const answer = newResponses.map((newResponse) => {
        const properResponse = newResponse;
        properResponse.projectId = projectId;
        properResponse.values = formatTextOnSave(properResponse.values);
        return BotResponses.update({ projectId, key: newResponse.key }, properResponse, { upsert: true });
    });

    return Promise.all(answer);
};

export const updateResponse = async (projectId, _id, newResponse) => {
    const formatedResponse = {
        ...newResponse,
        values: formatTextOnSave(newResponse.values),
    };
    return BotResponses.updateOne({ _id }, formatedResponse).exec();
};

export const createResponse = async (projectId, newResponse) => BotResponses.create({
    ...newResponse,
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
