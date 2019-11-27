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

export const updateResponse = async (projectId, key, newResponse) => {
    const formatedResponse = { ...newResponse, values: formatTextOnSave(newResponse.values) };
    return BotResponses.updateOne({ projectId, key }, formatedResponse).exec();
};
export const createResponse = async (projectId, newResponse) => BotResponses.create({ ...newResponse, projectId, _id: newResponse.key });
export const deleteResponse = async (projectId, key) => BotResponses.deleteOne({ projectId, key });


export const getBotResponses = async projectId => (BotResponses.find(
    {
        projectId,
    },
).lean());


export const getBotResponse = async (projectId, key, lang = 'en') => {
    let botResponse = await BotResponses.findOne(
        {
            projectId, key,
        },
    ).lean();
    const newSeq = {
        sequence: [{ content: safeDump({ text: key }) }],
        lang,
    };
    if (!botResponse) {
        botResponse = { key, values: [newSeq] };
        await createResponse(projectId, botResponse);
        return botResponse;
    }
    if (!botResponse.values.some(v => v.lang === lang)) {
        botResponse.values.push(newSeq);
        await updateResponse(projectId, key, botResponse);
    }
    return botResponse;
};
