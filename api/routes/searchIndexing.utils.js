const { Responses } = require('../models/models');
const { safeDump } = require('js-yaml/lib/js-yaml');
const { safeLoad } = require('js-yaml');

const indexResponseContent = ({ text = '', custom = null, buttons = [] }) => {
    const responseContent = [];
    if (text.length > 0) responseContent.push(text.replace(/\n/, ' '));
    if (custom) responseContent.push(safeDump(custom).replace(/\n/, ' '));
    buttons.forEach(({ title = '', payload = '', url = '' }) => {
        if (title.length > 0) responseContent.push(title);
        if (payload.length > 0) responseContent.push(payload);
        if (url.length > 0) responseContent.push(url);
    });
    return responseContent;
};

const indexBotResponse = (response) => {
    let responseContent = [];
    responseContent.push(response.key);
    response.values.forEach((value) => {
        value.sequence.forEach((sequence) => {
            responseContent = [...responseContent, ...indexResponseContent(safeLoad(sequence.content))];
        });
    });
    return responseContent.join('\n');
};

exports.createResponsesIndex = async (projectId, responses) => {
    const newResponses = typeof responses === 'string' ? JSON.parse(responses) : responses;
    // eslint-disable-next-line array-callback-return
    const answer = newResponses.map((newResponse) => {
        const properResponse = newResponse;
        properResponse.projectId = projectId;
        properResponse.textIndex = indexBotResponse(newResponse);
        return Responses.update({ projectId, key: newResponse.key }, properResponse, { upsert: true });
    });
    return Promise.all(answer);
};