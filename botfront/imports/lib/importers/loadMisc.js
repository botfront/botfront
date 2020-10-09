import yaml from 'js-yaml';

import { update } from './common';

export const addIncoming = ({
    f, rawText, setFileList,
}) => {
    const incoming = JSON.parse(rawText);
   
    if (!Array.isArray(incoming) || incoming.length < 1) {
        return update(setFileList, f, { dataType: 'incoming', warnings: 'There are no incoming in this file' });
    }
    return update(setFileList, f, { dataType: 'incoming', rawText, incoming });
};


export const addConversations = ({
    f, rawText, setFileList,
}) => {
    const conversations = JSON.parse(rawText);
   
    if (!Array.isArray(conversations) || conversations.length < 1) {
        return update(setFileList, f, { dataType: 'conversations', warnings: 'There are no conversations in this file' });
    }
    return update(setFileList, f, { dataType: 'conversations', rawText, conversations });
};


export const addEndpoints = ({
    f, rawText, setFileList,
}) => {
    let endpoints;
    try {
        endpoints = yaml.safeLoad(rawText);
    } catch (e) {
        return update(setFileList, f, { dataType: 'endpoints', errors: ['Not valid yaml'] });
    }
    return update(setFileList, f, { dataType: 'endpoints', rawText, endpoints });
};


export const addCredentials = ({
    f, rawText, setFileList,
}) => {
    let credentials;
    try {
        credentials = yaml.safeLoad(rawText);
    } catch (e) {
        return update(setFileList, f, { dataType: 'credentials', errors: ['Not valid yaml'] });
    }
    return update(setFileList, f, { dataType: 'credentials', rawText, credentials });
};


export const addRasaConfig = ({
    f, rawText, setFileList,
}) => {
    const errors = [];
    let rasaConfig;
    try {
        rasaConfig = yaml.safeLoad(rawText);
    } catch (e) {
        return update(setFileList, f, { dataType: 'rasaconfig', errors: ['Not valid yaml'] });
    }
    Object.keys(rasaConfig).forEach((key) => {
        if (!['pipeline', 'policies', 'language'].includes(key)) {
            errors.push(`${key} is not a valid rasa config data`);
        }
    });
    if (errors.length > 0) {
        return update(setFileList, f, { dataType: 'rasaconfig', errors });
    }
    return update(setFileList, f, { dataType: 'rasaconfig', rawText });
};


export const addBotfrontConfig = ({
    f, rawText, setFileList,
}) => {
    const errors = [];
    let bfConfig;
    try {
        bfConfig = yaml.safeLoad(rawText);
    } catch (e) {
        return update(setFileList, f, { dataType: 'bfconfig', errors: ['Not valid yaml'] });
    }
    Object.keys(bfConfig).forEach((key) => {
        if (!['project', 'instance'].includes(key)) {
            errors.push(`${key} is not valid botfront data`);
        }
    });
    if (errors.length > 0) {
        return update(setFileList, f, { dataType: 'bfconfig', errors });
    }
    return update(setFileList, f, { dataType: 'bfconfig', rawText, ...bfConfig });
};
