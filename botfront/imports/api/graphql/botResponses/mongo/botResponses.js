import { dump as yamlDump, safeLoad as yamlLoad, safeDump } from 'js-yaml';
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
    newResponses.map((newResponse) => {
        const properResponse = newResponse;
        properResponse.projectId = projectId;
        properResponse.values = formatTextOnSave(properResponse.values);
        BotResponses.update({ projectId, key: newResponse.key }, properResponse, { upsert: true });
    });

    return { ok: 1 };
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
export const deleteResponse = async (projectId, key) => BotResponses.deleteOne({ projectId, key });

export const getBotResponses = async projectId => BotResponses.find({
    projectId,
}).lean();

export const newGetBotResponses = async ({ projectId, template, language }) => {
    // template (optional): str || array
    // language (optional): str || array
    let templateKey = {}; let languageKey = {};
    if (template && Array.isArray(template)) templateKey = { key: { $in: template } };
    if (template && typeof template === 'string') templateKey = { key: template };
    if (language && Array.isArray(language)) languageKey = { 'values.lang': { $in: language } };
    if (language && typeof language === 'string') languageKey = { 'values.lang': language };
    return BotResponses.aggregate([
        { $match: { projectId, ...templateKey, ...languageKey } },
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

/* considering this function does not only get the response we need to trigger the onAddReponse subscription
when it does add a response the onAddResponse is used for that
contratry to update, the list of response need to be constatly updated to properly check the exceptions */
export const getBotResponse = async (projectId, key, lang = 'en', onAddResponse = () => {}) => {
    let botResponse = await BotResponses.findOne({
        projectId,
        key,
    }).lean();
    const newSeq = {
        sequence: [{ content: safeDump({ text: key }) }],
        lang,
    };
    if (!botResponse) {
        botResponse = { key, values: [newSeq] };
        const newResponse = await createResponse(projectId, botResponse);
        onAddResponse(projectId, newResponse);
        return newResponse;
    }
    if (!botResponse.values.some(v => v.lang === lang)) {
        botResponse.values.push(newSeq);
        await updateResponse(projectId, botResponse._id, botResponse);
    }
    return botResponse;
};


export const getBotResponseById = async (_id) => {
    const botResponse = await BotResponses.findOne({
        _id,
    }).lean();
    return botResponse;
};
