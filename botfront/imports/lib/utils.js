import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { sample, get } from 'lodash';
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
    if (error instanceof Meteor.Error) return error;

    // eslint-disable-next-line no-console
    if (process.env.MODE === 'development') console.log(error);

    const {
        response, request, code, message, reason, errmsg,
    } = error;
    
    if (response && response.status && response.data) {
        // axios error
        let errorInfo = response.data;
        if (Buffer.isBuffer(errorInfo)) {
            try {
                errorInfo = JSON.parse(errorInfo.slice(0, 1000).toString());
            } catch {
                //
            }
        }
        const { error: err = {}, message: msg, reason: rs } = errorInfo || {};
        return new Meteor.Error(
            response.status,
            err.message || err.reason || msg || rs || err || message || reason,
        );
    }
    if (request && code === 'ECONNREFUSED') {
        // axios error
        return new Meteor.Error(code, `Could not reach host at ${error.config.url}`);
    }

    if (code === 11000) {
        return new Meteor.Error(code, errmsg || message || reason);
    }

    return new Meteor.Error(code, message || reason);
};

export const getBackgroundImageUrl = () => {
    const result = GlobalSettings.findOne({}, { fields: { 'settings.public.backgroundImages': 1 } });
    const { settings: { public: { backgroundImages = [] } = {} } = {} } = (result || {});
    return backgroundImages.length ? sample(backgroundImages) : null;
};

export const isEntityValid = e => e && e.entity && (!Object.prototype.hasOwnProperty.call(e, 'value') || e.value.length > 0);

export const getProjectIdFromModelId = modelId => Projects.findOne({ nlu_models: modelId }, { fields: { _id: 1 } })._id;

export const getProjectModelFileName = (projectId, extension = null) => {
    const modelName = `model-${projectId}`;
    return extension ? `${modelName}.${extension}` : modelName;
};

export const getProjectModelLocalFolder = () => process.env.MODELS_LOCAL_PATH || '/app/models';

export const getProjectModelLocalPath = projectId => path.join(getProjectModelLocalFolder(), getProjectModelFileName(projectId, 'tar.gz'));


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
                // 400mb
                const maxContentLength = 400000000;
                const response = await axiosJson({
                    url, method, data, maxContentLength,
                });
                const { status, data: responseData } = response;
                return { status, data: responseData };
            } catch (e) {
                // eslint-disable-next-line no-console
                // if we console log the error here, it will write the image/model as a string, and the error message will be too bike and unusable.
                console.log('ERROR: Botfront encountered an error while calling a webhook');
                return { status: 500, data: e.response.data };
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

        async 'deploy.model' (projectId, target) {
            checkIfCan('nlu-data:x', projectId);
            check(target, String);
            check(projectId, String);
            const trainedModelPath = path.join(getProjectModelLocalPath(projectId));
            const modelFile = fs.readFileSync(trainedModelPath);
            const { namespace } = await Projects.findOne({ _id: projectId }, { fields: { namespace: 1 } });
            const data = {
                data: Buffer.from(modelFile).toString('base64'), // convert raw data to base64String so axios can handle it
                projectId,
                namespace,
                environment: target,
                mimeType: 'application/x-tar',
            };
            const settings = GlobalSettings.findOne({ _id: 'SETTINGS' }, { fields: { 'settings.private.webhooks.deploymentWebhook': 1 } });
            const deploymentWebhook = get(settings, 'settings.private.webhooks.deploymentWebhook', {});
            const { url, method } = deploymentWebhook;
            if (!url || !method) throw new Meteor.Error('400', 'No deployment webhook defined.');
            const resp = Meteor.call('axios.requestWithJsonBody', url, method, data);

            if (resp === undefined) throw new Meteor.Error('500', 'No response from the deployment webhook');
            if (resp.status === 404) throw new Meteor.Error('404', 'Deployment webhook not Found');
            if (resp.status !== 200) throw new Meteor.Error('500', `Deployment webhook ${get(resp, 'data.message', false) || ' rejected upload.'}`);
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
