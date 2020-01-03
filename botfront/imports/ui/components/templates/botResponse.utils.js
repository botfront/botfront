import { safeLoad, safeDump } from 'js-yaml';

const checkContentEmpty = content => (
    content.image
    || content.custom
    || (content.text.length > 0 && content.buttons && content.buttons.length && content.buttons[0].title)
    || (content.text && content.text.length > 0 && !content.buttons));

export const checkResponseEmpty = (response) => {
    let isEmpty = true;
    response.values.forEach((value) => {
        if (!isEmpty) return;
        value.sequence.forEach((variation) => {
            const content = safeLoad(variation.content);
            if (checkContentEmpty(content)) {
                isEmpty = false;
            }
        });
    });
    return isEmpty;
};

export const defaultTemplate = (template) => {
    if (template === 'TextPayload') {
        return { text: '', __typename: 'TextPayload' };
    }
    if (template === 'QuickReplyPayload') {
        return {
            __typename: 'QuickReplyPayload',
            text: '',
            buttons: [
                {
                    title: '',
                    type: 'postback',
                    payload: '',
                },
            ],
        };
    }
    if (template === 'CustomPayload') {
        return {
            __typename: 'CustomPayload',
        };
    }
    if (template === 'ImagePayload') {
        return {
            image: '',
            __typename: 'ImagePayload',
        };
    }
    return false;
};

export const createResponseFromTemplate = (type, language, options = {}) => {
    const { key: incommingKey } = options;
    const key = incommingKey || 'utter_';
    const newTemplate = {
        key,
        values: [
            {
                sequence: [{ content: safeDump(defaultTemplate(type)) }],
                lang: language,
            },
        ],
    };
    return newTemplate;
};

export const parseContentType = (content) => {
    switch (true) {
    case Object.keys(content).includes('custom'):
        return 'CustomPayload';
    case Object.keys(content).includes('image') && !Object.keys(content).includes('buttons'):
        return 'ImagePayload';
    case Object.keys(content).includes('buttons') && !Object.keys(content).includes('image'):
        return 'QuickReplyPayload';
    case Object.keys(content).includes('text') && !Object.keys(content).includes('image') && !Object.keys(content).includes('buttons'):
        return 'TextPayload';
    default: return 'CustomPayload';
    }
};

export const addContentType = content => ({ ...content, __typename: parseContentType(content) });

const getTemplateFromResponse = (response) => {
    const content = safeLoad(response.values[0].sequence[0].content);
    const contentType = parseContentType(content);
    const template = defaultTemplate(contentType);
    return safeDump(template);
};

export const addResponseLanguage = (response, language) => {
    const updatedResponse = response;
    const newValue = {
        sequence: getTemplateFromResponse(response),
        lang: language,
    };
    updatedResponse.values = [...response.values, newValue];
    return updatedResponse;
};
