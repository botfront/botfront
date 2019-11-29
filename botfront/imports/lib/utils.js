import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { sample } from 'lodash';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import React from 'react';

import { GlobalSettings } from '../api/globalSettings/globalSettings.collection';
import { checkIfCan } from '../api/roles/roles';

import { Projects } from '../api/project/project.collection';

export const formatAxiosError = (method, error) => {
    const { status, statusText } = error.response;
    return new Meteor.Error('status-code', `${method} request returned status code ${status} with message ${statusText}`);
};

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
    Meteor.methods({
        'upload.gcs'(fileBinaryString, projectId, bucket, fileName, options) {
            check(projectId, String);
            checkIfCan('global-admin');
            check(fileBinaryString, String);
            check(bucket, String);
            check(fileName, String);
            check(options, Match.Maybe(Object));
            this.unblock();

            try {
                const { makePublic = false } = options || {};

                checkIfCan('project-admin', projectId);
                const bytes = binaryStringToUint8Array(fileBinaryString);
                const path = `${Meteor.rootPath}/tmp/${fileName}`;

                Promise.await(uploadModel(bytes, path, bucket, makePublic));

                return 'ok';
            } catch (e) {
                console.log(e);
                throw formatError(e);
            }
        },

        'upload.modelToGCS'(fileBinaryString, projectId) {
            check(projectId, String);
            checkIfCan('global-admin');
            check(fileBinaryString, String);
            this.unblock();
            const { settings: { private: { gcpModelsBucket } } } = GlobalSettings.findOne({}, { fields: { 'settings.private.gcpModelsBucket': 1 } });
            return Meteor.call('upload.gcs', fileBinaryString, projectId, gcpModelsBucket, `prod-${projectId}.zip`);
        },
    });
}
export const getModelIdsFromProjectId = projectId => Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } }).nlu_models;

export const validateYaml = function() {
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

export function clearTypenameField(object) {
    const omitTypename = (key, value) => (key === '__typename' ? undefined : value);
    const cleanedObject = JSON.parse(JSON.stringify(object), omitTypename);
    return cleanedObject;
}
