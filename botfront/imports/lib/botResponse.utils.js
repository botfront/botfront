import { safeLoad, safeDump } from 'js-yaml';

const checkContentEmpty = (content) => {
    switch (true) {
    case content.custom && Object.keys(content.custom).length > 0:
        // custom response
        return true;
    case content.image && content.image.length > 0:
        // image response
        return true;
    case !!(content.text && content.text.length > 0 && content.buttons):
        // quick reply response with text
        return true;
    case !!(content.buttons && content.buttons.length > 0 && content.buttons[0].title && content.buttons[0].title.length):
        // quick reply response with buttons
        return true;
    case content.text && content.text.length > 0 && !content.buttons:
        // text response
        return true;
    default:
        return false;
    }
};

export const checkResponseEmpty = (response) => {
    let isEmpty = true;
    if (response.metadata) isEmpty = false;
    if (response.key !== 'utter_') isEmpty = false;
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
    switch (template) {
    case 'TextPayload':
        return { text: '', __typename: 'TextPayload' };
    case 'QuickReplyPayload':
        return {
            __typename: 'QuickReplyPayload',
            text: '',
            buttons: [
                {
                    title: '', type: 'postback', payload: '',
                },
            ],
        };
    case 'CustomPay load':
        return { __typename: 'CustomPayload' };
    case 'ImagePayload':
        return {
            image: '', __typename: 'ImagePayload',
        };
    default:
        return null;
    }
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
    case Object.keys(content).includes('custom') || Object.keys(content).includes('attachment') || Object.keys(content).includes('elements'):
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

export const checkMetadataSet = (metadata) => {
    if (!metadata) return false;
    const {
        linkTarget, userInput, forceOpen, forceClose,
    } = metadata;
    if (linkTarget === '_blank'
        && userInput === 'show'
        && forceOpen === false
        && forceClose === false
    ) {
        return false;
    }
    return true;
};

export const addTemplateLanguage = (templates, language) => templates
    .map((template) => {
        const type = parseContentType(safeLoad(template.payload));
        const payload = safeDump(defaultTemplate(type));
        return {
            ...template,
            language,
            payload,
        };
    });
