import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { sample } from 'lodash';
import yaml from 'js-yaml';
import path from 'path';
import React, { useState } from 'react';
import axios from 'axios';

import { GlobalSettings } from '../api/globalSettings/globalSettings.collection';
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
        async reportCrash(error) {
            check(error, Object);
            return { reported: false };
        },
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

export function useMethod(methodName, { transform } = {}) {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const call = (...args) => {
        setIsLoading(true);
        return new Promise((resolve, reject) => {
            Meteor.call(methodName, ...args, (err, result) => {
                if (err) {
                    setError(err);
                    reject(err);
                } else {
                    setData(transform ? transform(result) : result);
                    resolve(result);
                }
                setIsLoading(false);
            });
        });
    };

    return {
        isLoading, data, error, call,
    };
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
