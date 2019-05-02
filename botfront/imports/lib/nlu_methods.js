/* eslint-disable camelcase */
import yaml from 'js-yaml';
import queryString from 'query-string';
import axios from 'axios';
import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import axiosRetry from 'axios-retry';
import { NLUModels } from '../api/nlu_model/nlu_model.collection';
import { Evaluations } from '../api/nlu_evaluation';
import ExampleUtils from '../ui/components/utils/ExampleUtils';
import { GlobalSettings } from '../api/globalSettings/globalSettings.collection';
import { checkIfCan } from './scopes';

export const getConfig = (model) => {
    const config = yaml.safeLoad(model.config);
    if (!config.pipeline) {
        throw new Meteor.Error('Please set a configuration');
    }
    config.pipeline.forEach((item) => {
        if (item.name.includes('fuzzy_gazette')) {
            if (model.training_data.fuzzy_gazette) {
                // eslint-disable-next-line no-param-reassign
                item.entities = model.training_data.fuzzy_gazette.map(({ value, mode, min_score }) => ({ name: value, mode, min_score }));
            }
        }
    });

    config.language = model.language;
    const apiHost = GlobalSettings.findOne({ _id: 'SETTINGS' }).settings.private.bfApiHost;
    if (model.logActivity && apiHost) {
        config.pipeline.push({
            name: 'components.botfront.activity_logger.ActivityLogger',
            url: `${apiHost}/log-utterance`,
        });
    }
    return yaml.dump(config);
};

export const getTrainingDataInRasaFormat = (model, withSynonyms = true, intents = [], withChitChat = true, chitChatFunc = () => [], withGazette = true) => {
    if (!model.training_data) {
        throw Error('Property training_data of model argument is required');
    }

    function copyAndFilter(obj) {
        const copy = JSON.parse(JSON.stringify(obj));
        delete copy._id;
        delete copy.mode;
        delete copy.min_score;
        return copy;
    }

    // Load examples
    let common_examples = model.training_data.common_examples.map(e => ExampleUtils.stripBare(e, false));
    if (intents.length > 0) {
        // filter by intent if specified
        common_examples = common_examples.filter(e => intents.indexOf(e.intent) >= 0);
    }

    const entity_synonyms = withSynonyms && model.training_data.entity_synonyms ? model.training_data.entity_synonyms.map(copyAndFilter) : [];
    const fuzzy_gazette = withGazette && model.training_data.fuzzy_gazette ? model.training_data.fuzzy_gazette.map(copyAndFilter) : [];

    return { rasa_nlu_data: { common_examples, entity_synonyms, fuzzy_gazette } };
};

if (Meteor.isServer) {
    export const parseNlu = async (projectId, modelId, instance, queryParamsList, nolog = true) => {
        check(projectId, String);
        check(modelId, String);
        check(instance, Object);
        check(queryParamsList, Array);
        check(nolog, Boolean);
        try {
            const client = axios.create({
                baseURL: instance.host,
                timeout: 100 * 1000,
            });
            // axiosRetry(client, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
            const requests = queryParamsList.map((queryParams) => {
                const params = Object.assign(queryParams, {
                    project: projectId,
                    model: modelId,
                });
                if (instance.token) params.token = instance.token;
                const qs = queryString.stringify(params);
                const url = `${instance.host}/parse?${qs}`;
                return client.get(url);
            });

            const result = await axios.all(requests);
            if (result.length === 1 && result[0].status === 200) {
                return result[0].data;
            }

            if (result.length > 1 && result.filter(r => r.status !== 200).length === 0) {
                return result.map(r => r.data);
            }

            throw new Meteor.Error('Error when parsing NLU');
        } catch (e) {
            if (e instanceof Meteor.Error) {
                throw e;
            } else {
                throw new Meteor.Error('500', e.message);
            }
        }
    };

    Meteor.methods({
        'nlu.parse'(projectId, modelId, instance, params, nolog = true) {
            check(projectId, String);
            check(modelId, String);
            check(instance, Object);
            check(params, Array);
            check(nolog, Boolean);
            checkIfCan('nlu-model:x', projectId);
            this.unblock();
            return parseNlu(projectId, modelId, instance, params, nolog);
        },

        'nlu.train'(modelId, projectId, instance) {
            check(modelId, String);
            check(projectId, String);
            check(instance, Object);
            checkIfCan('nlu-model:x', projectId);
            // prepare training data
            try {
                this.unblock();
                const model = NLUModels.findOne({ _id: modelId });
                check(model, Object);
                const config = getConfig(model);
                const examples = getTrainingDataInRasaFormat(model, true);
                const trainingInfo = `${config}\ndata: ${JSON.stringify(examples, null, 2)}`;

                const params = { project: projectId, model: model._id };
                if (instance.token) Object.assign(params, { token: instance.token });
                const qs = queryString.stringify(params);
                const client = axios.create({
                    headers: { 'content-type': 'application/x-yml' },
                    baseURL: model.host,
                    // timeout: 60 * 60 * 1000,
                });
                axiosRetry(client, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
                const url = `${instance.host}/train?${qs}`;
                Promise.await(client.post(url, trainingInfo));
                Meteor.call('nlu.markTrainingStopped', modelId, 'success');
                return 'OK'; // because you need to return something
            } catch (e) {
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

                console.log(error);
                Meteor.call('nlu.markTrainingStopped', modelId, 'failure', error.reason);
                throw error;
            }
        },

        'nlu.evaluate'(modelId, projectId, instance, testData) {
            check(projectId, String);
            check(modelId, String);
            check(instance, Object);
            check(testData, Match.Maybe(Object));
            checkIfCan('nlu-model:x', projectId);
            try {
                this.unblock();
                const model = NLUModels.findOne({ _id: modelId });
                check(model, Object);
                const examples = testData || getTrainingDataInRasaFormat(model, false);
                const params = { project: projectId, model: model._id };
                if (instance.token) Object.assign(params, { token: instance.token });
                const qs = queryString.stringify(params);
                const client = axios.create({
                    baseURL: instance.host,
                    timeout: 60 * 60 * 1000,
                });
                axiosRetry(client, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
                const url = `${instance.host}/evaluate?${qs}`;
                const results = Promise.await(client.post(url, examples));
                if (results.data.entity_evaluation) {
                    const ee = results.data.entity_evaluation;
                    Object.keys(ee).forEach((key) => {
                        const newKeyName = key.replace(/\./g, '_');
                        ee[newKeyName] = ee[key];
                        delete ee[key];
                    });
                }
                const evaluations = Evaluations.find({ modelId }, { field: { _id: 1 } }).fetch();
                if (evaluations.length > 0) {
                    Evaluations.update({ _id: evaluations[0]._id }, { $set: { results: results.data } });
                } else {
                    Evaluations.insert({ results: results.data, modelId });
                }
                return 'ok';
            } catch (e) {
                let error = null;
                if (e.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    error = new Meteor.Error(e.response.status, e.response.data);
                } else if (e.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    error = new Meteor.Error('399', 'timeout');
                } else {
                    // Something happened in setting up the request that triggered an Error
                    error = new Meteor.Error('500', e);
                }
                console.log(error);
                throw error;
            }
        },
    });
}
