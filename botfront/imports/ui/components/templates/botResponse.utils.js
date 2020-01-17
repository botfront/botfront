import { safeLoad, safeDump } from 'js-yaml';

const checkContentEmpty = content => (
    (content._isCustom && Object.keys(content).length > 2)
    || (content.image && content.image.length > 0)
    || ((content.text && content.text.length > 0 && content.buttons)
        || (content.buttons && content.buttons.length > 0 && content.buttons[0].title))
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
            _isCustom: true,
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
    case Object.keys(content).includes('_isCustom'):
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

export const getDefaultTemplateFromSequence = (sequence) => {
    const content = safeLoad(sequence[0].content);
    const typeName = parseContentType((content));
    return defaultTemplate(typeName);
};

export const addResponseLanguage = (response, language) => {
    const updatedResponse = response;
    const newValue = {
        sequence: [{ content: safeDump(defaultTemplate(parseContentType(safeLoad(response.values[0].sequence[0].content)))) }],
        lang: language,
    };
    updatedResponse.values = [...response.values, newValue];
    return updatedResponse;
};
