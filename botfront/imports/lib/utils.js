import { Meteor } from 'meteor/meteor';
import { sample } from 'lodash';
import yaml from 'js-yaml';

import { GlobalSettings } from '../api/globalSettings/globalSettings.collection';
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

export const validateYaml = function() {
    try {
        yaml.safeLoad(this.value);
        return null;
    } catch (e) {
        return e.reason;
    }
};
