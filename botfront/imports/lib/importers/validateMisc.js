import yaml from 'js-yaml';


export const doValidation = params => !params.noValidate;


export const loadIncoming = ({
    file, params,
}) => {
    const incoming = JSON.parse(file.rawText);
    if (doValidation(params) && (!Array.isArray(incoming) || incoming.length < 1)) {
        return { file, warnings: [...(file?.warnings || []), 'There are no incoming in this file'] };
    }
    return {
        ...file, incoming,
    };
};


export const loadConversations = ({
    file, params,
}) => {
    const conversations = JSON.parse(file.rawText);
    if (doValidation(params) && (!Array.isArray(conversations) || conversations.length < 1)) {
        return { ...file, warnings: [...(file?.warnings || []), 'There are no conversations in this file'] };
    }
    return {
        ...file, conversations,
    };
};


export const loadEndpoints = ({
    file,
}) => {
    let endpoints;
    try {
        endpoints = yaml.safeLoad(file.rawText);
    } catch (e) {
        return {
            ...file, errors: [...(file?.errors || []), 'Not valid yaml'],
        };
    }
    return {
        ...file, endpoints,
    };
};


export const loadCredentials = ({
    file,
}) => {
    let credentials;
    try {
        credentials = yaml.safeLoad(file.rawText);
    } catch (e) {
        return {
            ...file, errors: [...(file?.errors || []), 'Not valid yaml'],
        };
    }
    return {
        ...file, credentials,
    };
};


export const loadRasaConfig = ({
    file, params,
}) => {
    const errors = [];
    const { rawText } = file;
    let rasaConfig;
    try {
        rasaConfig = yaml.safeLoad(rawText);
    } catch (e) {
        return {
            ...file, errors: [...(file?.errors || []), 'Not valid yaml'],
        };
    }
    if (doValidation(params)) {
        const configsKeys = Object.keys(rasaConfig);
        configsKeys.forEach((key) => {
            if (!['pipeline', 'policies', 'language'].includes(key)) {
                errors.push(`${key} is not a valid rasa config data`);
            }
        });
        if (configsKeys.length < 3) {
            const missingKeys = ['pipeline', 'policies', 'language'].filter(key => !configsKeys.includes(key));
            errors.push(`${missingKeys.join(', ')} missing in the rasa config data`);
        }
        if (errors.length > 0) {
            return {
                ...file, errors: [...(file?.errors || []), ...errors],
            };
        }
    }
    return {
        ...file, ...rasaConfig,
    };
};


export const loadBotfrontConfig = ({
    file, params,
}) => {
    const errors = [];
    const { rawText } = file;

    let bfConfig;
    try {
        bfConfig = yaml.safeLoad(rawText);
    } catch (e) {
        return {
            ...file, errors: [...(file?.errors || []), ['Not valid yaml']],
        };
    } if (doValidation(params)) {
        const configsKeys = Object.keys(bfConfig);
        configsKeys.forEach((key) => {
            if (!['project', 'instance'].includes(key)) {
                errors.push(`${key} is not valid botfront data`);
            }
        });
        if (configsKeys.length < 2) {
            const missingKeys = ['project', 'instance'].filter(key => !configsKeys.includes(key));
            errors.push(`${missingKeys.join(', ')} missing in the rasa config data`);
        }
        if (errors.length > 0) {
            return {
                ...file, errors: [...(file?.errors || []), ...errors],
            };
        }
    }
    return {
        ...file, ...bfConfig,
    };
};
