import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { sample, get } from 'lodash';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import React from 'react';
import axios from 'axios';
import BotResponses from '../api/graphql/botResponses/botResponses.model';

import { GlobalSettings } from '../api/globalSettings/globalSettings.collection';
import { checkIfCan } from './scopes';

import { Projects } from '../api/project/project.collection';

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

export const getProjectModelFileName = (projectId, extension = null) => {
    const modelName = `model-${projectId}`;
    return extension ? `${modelName}.${extension}` : modelName;
};

export const getProjectModelLocalFolder = () => process.env.MODELS_LOCAL_PATH || '/app/models';

export const getProjectModelLocalPath = projectId => path.join(getProjectModelLocalFolder(), getProjectModelFileName(projectId, 'tar.gz'));

export const getImageUrls = (response, excludeLang = '') => (
    response.values.reduce((vacc, vcurr) => {
        if (vcurr.lang !== excludeLang) {
            return [
                ...vacc,
                ...vcurr.sequence.reduce((sacc, scurr) => {
                    // image is for image response, image_url is for carousels
                    const { image, elements } = yaml.safeLoad(scurr.content);
                    if (!image && !elements) return sacc; // neither a image or a carousel

                    let imagesSources = [image]; // let assume the response is an imageResponse
                    if (elements) {
                        // if it's a carouselResponse image source will be replaced
                        imagesSources = elements.map(element => element.image_url);
                    }
                    return [...sacc, ...imagesSources];
                }, []),
            ];
        }
        return vacc;
    }, []));

export const getWebhooks = () => {
    const {
        settings: {
            private: { webhooks },
        },
    } = GlobalSettings.findOne({}, { fields: { 'settings.private.webhooks': 1 } });
    return webhooks;
};

export const deleteImages = async (imgUrls, projectId, url, method) => Promise.all(
    imgUrls.map(imageUrl => Meteor.callWithPromise('axios.requestWithJsonBody', url, method, {
        projectId,
        uri: imageUrl,
    })),
);
export function secondsToDaysHours(sec) {
    const floorSec = Math.floor(sec);
    const d = Math.floor(floorSec / (3600 * 24));
    const h = Math.floor((floorSec % (3600 * 24)) / 3600);

    const dDisplay = d > 0 ? d + (d === 1 ? ' day, ' : ' days, ') : '';
    const hDisplay = h + (h <= 1 ? ' hour, ' : ' hours ');

    return dDisplay + hDisplay;
}

const getPostTrainingWebhook = async () => {
    const globalSettings = await GlobalSettings.findOne({ _id: 'SETTINGS' }, { fields: { 'settings.private.webhooks.postTraining': 1 }})
    return globalSettings?.settings?.private?.webhooks?.postTraining;
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
                // if we console log the error here, it will write the image/model as a string, and the error message will be too bike and unusable.
                // eslint-disable-next-line no-console
                console.log('ERROR: Botfront encountered an error while calling a webhook');
                console.log(e.response || e)
                return { status: 500, data: e?.response?.data || e };
            }
        },

        async reportCrash(error) {
            check(error, Object);
            try {
                const { reportCrashWebhook: { url, method } = {} } = await getWebhooks();
                if (url && method) {
                    try {
                        await Meteor.callWithPromise('axios.requestWithJsonBody', url, method, error);
                    } catch {
                        //
                    }
                    return { reported: true };
                }
                throw new Error();
            } catch {
                return { reported: false };
            }
        },

        async 'upload.image'(projectId, data) {
            checkIfCan('responses:w', projectId);
            check(projectId, String);
            check(data, Object);
            const { uploadImageWebhook: { url, method } } = await getWebhooks();
            if (!url || !method) throw new Meteor.Error('400', 'No image upload webhook defined.');
            const resp = Meteor.call('axios.requestWithJsonBody', url, method, data);
            if (resp === undefined) throw new Meteor.Error('500', 'No response from the image upload  webhook');
            if (resp.status === 404) throw new Meteor.Error('404', 'Image upload webhook not Found');
            if (resp.status !== 200) throw new Meteor.Error('500', 'Image upload rejected upload.');
            return resp;
        },

        async 'delete.image'(projectId, imgSrc, key, lang) {
            checkIfCan('responses:w', projectId);
            check(projectId, String);
            check(imgSrc, String);
            check(key, String);
            const {
                deleteImageWebhook: { url, method },
            } = getWebhooks();
            if (url && method) {
                const response = await BotResponses.findOne({ projectId, key }).lean();
                const imagesUrls = getImageUrls(response, lang); // check if the url is used in any other language
                if (imagesUrls.filter(x => x == imgSrc).length < 1) {
                    deleteImages([imgSrc], projectId, url, method);
                }
            }
        },

        async 'deploy.model'(projectId, target) {
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
            Meteor.call('credentials.appendWidgetSettings', projectId, target);
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
        async 'call.postTraining'(projectId, modelData) {
            checkIfCan('nlu-data:x')
            check(projectId, String)
            const trainingWebhook = await getPostTrainingWebhook();
            if (!trainingWebhook.url || !trainingWebhook.method) {
                return;
            }
            console.log(trainingWebhook)
            const { namespace } = await Projects.findOne({ _id: projectId }, { fields: { namespace: 1 }})
            const body = {
                projectId,
                namespace,
                model: Buffer.from(modelData).toString('base64'),
                mimeType: 'application/x-tar',
            }
            Meteor.call('axios.requestWithJsonBody', trainingWebhook.url, trainingWebhook.method, body)
        }
    });
}

export const validateYaml = function () {
    try {
        yaml.safeLoad(this.value);
        return null;
    } catch (e) {
        return e.reason;
    }
};


export const validateJSON = function () {
    try {
        JSON.parse(this.value);
        return null;
    } catch (e) {
        return e;
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


export function cleanDucklingFromExamples(examples) {
    return examples.map((example) => {
        if (!example.entities) return example;
        const duckling = new RegExp('duckling', 'i');
        return {
            ...example,
            entities: example.entities.filter(entity => !duckling.test(entity.extractor)),
        };
    });
}
