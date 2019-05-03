import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { sample } from 'lodash';
import fs from 'fs';

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

function uploadFile (filePath, bucket) {
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
            .then(() => uploadFile(path, bucket))
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
            check(fileBinaryString, String);
            check(projectId, String);
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
            check(fileBinaryString, String);
            check(projectId, String);
            this.unblock();
            const { settings: { private: { gcpBucketCore } } } = GlobalSettings.findOne({}, { fields: { 'settings.private.gcpBucketCore': 1 } });
            return Meteor.call('upload.gcs', fileBinaryString, projectId, gcpBucketCore, `prod-${projectId}.zip`);
        },
    });
}
