import { Meteor } from 'meteor/meteor';
import { sample } from 'lodash';

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

export const getBackgroundImageUrl = () => {
    const result = GlobalSettings.findOne({}, { fields: { 'settings.public.backgroundImages': 1 } });
    const { settings: { public: { backgroundImages = [] } = {} } = {} } = (result || {});
    return backgroundImages.length ? sample(backgroundImages) : null;
};

export const isEntityValid = e => e && e.entity && (!Object.prototype.hasOwnProperty.call(e, 'value') || e.value.length > 0);

export const getProjectIdFromModelId = modelId => Projects.findOne({ nlu_models: modelId }, { fields: { _id: 1 } })._id;
