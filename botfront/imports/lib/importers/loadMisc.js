import yaml from 'js-yaml';


export const doValidation = params => !params.noValidate;


export const loadIncoming = ({
    file, rawText, params,
}) => {
    const incoming = JSON.parse(rawText);
    if (doValidation(params) && (!Array.isArray(incoming) || incoming.length < 1)) {
        return { file, dataType: 'incoming', warnings: [...(file?.warnings || []), 'There are no incoming in this file'] };
    }
    return {
        file, dataType: 'incoming', rawText, incoming,
    };
};


export const loadConversations = ({
    file, rawText, params,
}) => {
    const conversations = JSON.parse(rawText);
    if (doValidation(params) && (!Array.isArray(conversations) || conversations.length < 1)) {
        return { file, dataType: 'conversations', warnings: [...(file?.warnings || []), 'There are no conversations in this file'] };
    }
    return {
        file, dataType: 'conversations', rawText, conversations,
    };
};


export const loadEndpoints = ({
    file, rawText,
}) => {
    let endpoints;
    try {
        endpoints = yaml.safeLoad(rawText);
    } catch (e) {
        return {
            file, dataType: 'endpoints', rawText, errors: [...(file?.errors || []), 'Not valid yaml'],
        };
    }
    return {
        file, dataType: 'endpoints', rawText, endpoints,
    };
};


export const loadCredentials = ({
    file, rawText,
}) => {
    let credentials;
    try {
        credentials = yaml.safeLoad(rawText);
    } catch (e) {
        return {
            file, dataType: 'credentials', rawText, errors: [...(file?.errors || []), 'Not valid yaml'],
        };
    }
    return {
        file, dataType: 'credentials', rawText, credentials,
    };
};


export const loadRasaConfig = ({
    file, rawText, params,
}) => {
    const errors = [];
    let rasaConfig;
    try {
        rasaConfig = yaml.safeLoad(rawText);
    } catch (e) {
        return {
            file, dataType: 'rasaconfig', rawText, errors: [...(file?.errors || []), 'Not valid yaml'],
        };
    }
    if (doValidation(params)) {
        Object.keys(rasaConfig).forEach((key) => {
            if (!['pipeline', 'policies', 'language'].includes(key)) {
                errors.push(`${key} is not a valid rasa config data`);
            }
        });
        if (errors.length > 0) {
            return {
                file, dataType: 'rasaconfig', rawText, errors: [...(file?.errors || []), ...errors],
            };
        }
    }
    return {
        file, dataType: 'rasaconfig', rawText, ...rasaConfig,
    };
};


export const loadBotfrontConfig = ({
    file, rawText, params,
}) => {
    const errors = [];
    let bfConfig;
    try {
        bfConfig = yaml.safeLoad(rawText);
    } catch (e) {
        return {
            file, rawText, dataType: 'bfconfig', errors: [...(file?.errors || []), ['Not valid yaml']],
        };
    } if (doValidation(params)) {
        Object.keys(bfConfig).forEach((key) => {
            if (!['project', 'instance'].includes(key)) {
                errors.push(`${key} is not valid botfront data`);
            }
        });
        if (errors.length > 0) {
            return {
                file, rawText, dataType: 'bfconfig', errors: [...(file?.errors || []), ...errors],
            };
        }
    }
    return {
        file, rawText, dataType: 'bfconfig', ...bfConfig,
    };
};
