import { Meteor } from 'meteor/meteor';
import { sample } from 'lodash';
import yaml from 'js-yaml';
import path from 'path';
import React from 'react';
import axios from 'axios';

import { GlobalSettings } from '../api/globalSettings/globalSettings.collection';
import { Projects } from '../api/project/project.collection';
import { NLUModels } from '../api/nlu_model/nlu_model.collection';
import { getNluModelLanguages } from '../api/nlu_model/nlu_model.utils';

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

    const {
        response, request, code, message,
    } = error;
    
    if (response && response.status) {
        // axios error
        return new Meteor.Error(error.response.status, error.response.data.error);
    }
    if (request && code === 'ECONNREFUSED') {
        // axios error
        return new Meteor.Error('500', `Could not reach host at ${error.config.url}`);
    }

    if (code === 11000) {
        return new Meteor.Error('Duplicate key', error.errmsg);
    }

    return new Meteor.Error('error', message);
};

export const getBackgroundImageUrl = () => {
    const result = GlobalSettings.findOne({}, { fields: { 'settings.public.backgroundImages': 1 } });
    const { settings: { public: { backgroundImages = [] } = {} } = {} } = (result || {});
    return backgroundImages.length ? sample(backgroundImages) : null;
};

export const isEntityValid = e => e && e.entity && (!Object.prototype.hasOwnProperty.call(e, 'value') || e.value.length > 0);

export const getProjectIdFromModelId = modelId => Projects.findOne({ nlu_models: modelId }, { fields: { _id: 1 } })._id;

if (Meteor.isServer) {
    import {
        getAppLoggerForMethod,
        getAppLoggerForFile,
        addLoggingInterceptors,
    } from '../../server/logger';

    Meteor.methods({
        async 'axios.requestWithJsonBody'(url, method, data) {
            let loggedData = data;
            // remplace data by placeholder for images or everything not json
            if (data.mimeType && data.mimeType !== 'application/json') loggedData = `Data is ${data.mimeType} and is not logged`;
            const appMethodLogger = getAppLoggerForMethod(
                getAppLoggerForFile(__filename),
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
                const response = await axiosJson({ url, method, data });
                const { status, data: responseData } = response;
                return { status, data: responseData };
            } catch (e) {
                if (e.response) return { status: e.response.status };
                return { status: 408 };
            }
        },
    });
}

export const getModelIdsFromProjectId = projectId => (Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } }) || {}).nlu_models;

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
