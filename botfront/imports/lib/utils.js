import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { sample } from 'lodash';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import React from 'react';
import axios from 'axios';

import { GlobalSettings } from '../api/globalSettings/globalSettings.collection';
import { checkIfCan } from './scopes';

import { Projects } from '../api/project/project.collection';
import { NLUModels } from '../api/nlu_model/nlu_model.collection';
import { getNluModelLanguages } from '../api/nlu_model/nlu_model.utils';
import { getImageWebhooks } from '../api/graphql/botResponses/mongo/botResponses';

export const formatAxiosError = (method, error) => {
    const { status, statusText } = error.response;
    return new Meteor.Error('status-code', `${method} request returned status code ${status} with message ${statusText}`);
};

export const setsAreIdentical = (arr1, arr2) => (
    arr1.every(en => arr2.includes(en))
    && arr2.every(en => arr1.includes(en))
);

Meteor.callWithPromise = (method, ...myParameters) => new Promise((resolve, reject) => {
    Meteor.call(method, ...myParameters, (err, res) => {
        if (err) reject(err);
        resolve(res);
    });
});

export const formatError = (error) => {
    const { response } = error;
    if (response && response.status) {
        // axios error
        return formatAxiosError('HTTP', error);
    }

    if (error.code && error.code === 11000) {
        return new Meteor.Error('Duplicate key', error.errmsg);
    }

    const { name, error: type, message } = error;
    if ((type || name) && message) {
        if (type) {
            // regular meteor error
            return error;
        } if (name) {
            // mongo error
            return new Meteor.Error('mongo', `${type}: ${message}`);
        }
    } else if (message) {
        // some other kind of error
        return new Meteor.Error('error', message);
    }


    // fallback error
    console.log(error);
    return new Meteor.Error('unknown', 'Something went wrong');
};

export const getAxiosError = (e) => {
    console.log(e);
    // TODO identify all possible error object structure and create an external function to derive code and message consistently
    let error = null;
    if (e.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        error = new Meteor.Error(e.response.status, e.response.data.error);
    } else if (e.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        error = new Meteor.Error('399', 'timeout');
    } else {
        // Something happened in setting up the request that triggered an Error
        error = new Meteor.Error('500', e.message);
    }
    return error;
};

export const getBackgroundImageUrl = () => {
    const result = GlobalSettings.findOne({}, { fields: { 'settings.public.backgroundImages': 1 } });
    const { settings: { public: { backgroundImages = [] } = {} } = {} } = (result || {});
    return backgroundImages.length ? sample(backgroundImages) : null;
};

export const isEntityValid = e => e && e.entity && (!Object.prototype.hasOwnProperty.call(e, 'value') || e.value.length > 0);

export const getProjectIdFromModelId = modelId => Projects.findOne({ nlu_models: modelId }, { fields: { _id: 1 } })._id;

function writeFile (path, bytes) {
    // TODO make it async when we have more traffic
    if (!fs.existsSync(`${Meteor.rootPath}/tmp`)) {
        fs.mkdirSync(`${Meteor.rootPath}/tmp`);
    }
    return new Promise((resolve, reject) => {
        fs.writeFile(path, bytes, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function deleteTemp (path) {
    return new Promise((resolve) => {
        fs.unlink(path, (err) => {
            // TODO we don't want to reject here but probably log this somewhere
            if (err) console.log(err);
            resolve();
        });
    });
}

export function uploadFileToGcs (filePath, bucket) {
    const { Storage } = require('@google-cloud/storage');
    const storage = new Storage();
    return new Promise((resolve, reject) => storage.bucket(bucket)
        .upload(filePath)
        .then(resolve)
        .catch(reject));
}

function binaryStringToUint8Array(fileBinaryString) {
    const bytes = new Uint8Array(fileBinaryString.length);
    for (let i = 0; i < fileBinaryString.length; i++) bytes[i] = fileBinaryString.charCodeAt(i);
    return bytes;
}

function uploadModel(bytes, path, bucket, makePublic) {
    return new Promise((resolve, reject) => {
        writeFile(path, bytes)
            .then(() => uploadFileToGcs(path, bucket))
            .then(([file]) => {
                if (makePublic) {
                    return file.makePublic();
                }
                return null;
            })
            .then(() => deleteTemp(path))
            .then(resolve)
            .catch(reject);
    });
}

if (Meteor.isServer) {
    import {
        getAppLoggerForMethod,
        getAppLoggerForFile,
        addLoggingInterceptors,
    // eslint-disable-next-line import/no-duplicates
    } from '../../server/logger';


    const fileLogger = getAppLoggerForFile(__filename);
    Meteor.methods({

        async 'axios.requestWithJsonBody'(url, method, data) {
            let loggedData = data;
            // remplace data by placeholder for images or everything not json
            if (data.mimeType && data.mimeType !== 'application/json') loggedData = `Data is ${data.mimeType} and is not logged`;
            const appMethodLogger = getAppLoggerForMethod(
                fileLogger,
                'axios.requestWithJsonBody',
                Meteor.userId(),
                { url, method, data: loggedData },
            );

            check(url, String);
            check(method, String);
            check(data, Object);
            try {
                const axiosJson = axios.create();
                addLoggingInterceptors(axiosJson, appMethodLogger);
                // 4mb
                const maxContentLength = 4000000;
                const response = await axiosJson({
                    url, method, data, maxContentLength,
                });
                const { status, data: responseData } = response;
                return { status, data: responseData };
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log('ERROR: Botfront encountered an error while uploading an image', e);
                return { status: 500, data: e.message };
            }
        },

        async 'upload.image' (projectId, data) {
            checkIfCan('responses:w', projectId);
            check(projectId, String);
            check(data, Object);
            const { uploadImageWebhook: { url, method } } = await getImageWebhooks();
            if (!url || !method) throw new Meteor.Error('400', 'No image upload webhook defined.');
            const resp = Meteor.call('axios.requestWithJsonBody', url, method, data);
            if (resp === undefined) throw new Meteor.Error('500', 'No response from the image upload  webhook');
            if (resp.status === 404) throw new Meteor.Error('404', 'Image upload webhook not Found');
            if (resp.status !== 200) throw new Meteor.Error('500', 'Image upload rejected upload.');
            return resp;
        },
    });
}


export const getModelIdsFromProjectId = projectId => (Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } }) || {}).nlu_models;

// used from outside botfront
// -permission- add check with apikey
export const getLanguagesFromProjectId = projectId => getNluModelLanguages(getModelIdsFromProjectId(projectId));

export const getAllTrainingDataGivenProjectIdAndLanguage = (projectId, language) => {
    const nluModelIds = getModelIdsFromProjectId(projectId);
    const models = NLUModels.find({ _id: { $in: nluModelIds }, language }, { fields: { training_data: 1 } }).fetch();
    return models.map(model => model.training_data.common_examples)
        .reduce((acc, x) => acc.concat(x), []);
};


export const validateYaml = function () {
    try {
        yaml.safeLoad(this.value);
        return null;
    } catch (e) {
        return e.reason;
    }
};

export const getProjectModelFileName = (projectId, extension = null) => {
    const modelName = `model-${projectId}`;
    return extension ? `${modelName}.${extension}` : modelName;
};

export const getProjectModelLocalFolder = () => process.env.MODELS_LOCAL_PATH || '/app/models';

export const getProjectModelLocalPath = projectId => path.join(getProjectModelLocalFolder(), getProjectModelFileName(projectId, 'tar.gz'));

export const formatMessage = (message) => {
    const bits = message.split('*');
    return (
        <>
            {bits.map((bit, idx) => ((idx % 2 !== 0)
                ? <b>{bit}</b>
                : <>{bit}</>
            ))}
        </>
    );
};

export function auditLogIfOnServer(message, meta) {
    if (Meteor.isServer) {
        import {
            auditLog,
        // eslint-disable-next-line import/no-duplicates
        } from '../../server/logger';

        auditLog(message, meta);
    }
}

export function findName(name, names) {
    const sameNamed = names.filter(c => c.replace(/ \(\d+\)/, '') === name);
    if (!sameNamed.length) return name;
    return `${name} (${sameNamed.length + 1})`;
}
