/* eslint-disable camelcase */
import { check, Match } from 'meteor/check';
import queryString from 'query-string';
import axiosRetry from 'axios-retry';
import yaml from 'js-yaml';
import axios from 'axios';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import {
    getAxiosError, getModelIdsFromProjectId, getProjectModelLocalFolder, getProjectModelFileName,
} from '../../lib/utils';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';
import ExampleUtils from '../../ui/components/utils/ExampleUtils';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { Instances } from './instances.collection';
import { CorePolicies } from '../core_policies';
import { Evaluations } from '../nlu_evaluation';
import { ActivityCollection } from '../activity';
import { getStoriesAndDomain } from '../../lib/story.utils';

export const createInstance = async (project) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    const orchestration = process.env.ORCHESTRATOR ? process.env.ORCHESTRATOR : 'docker-compose';

    try {
        const { getDefaultInstance } = await import(`./instances.${orchestration}`);
        const instance = await getDefaultInstance(project);
        if (Array.isArray(instance)) {
            instance.forEach(inst => Instances.insert(inst));
            return;
        }
        if (instance) {
            // eslint-disable-next-line consistent-return
            return await Instances.insert(instance);
        }
    } catch (e) {
        throw new Error('Could not create default instance', e);
    }
};

const getConfig = (model) => {
    const config = yaml.safeLoad(model.config);
    if (!config.pipeline) {
        throw new Meteor.Error('Please set a configuration');
    }
    config.pipeline.forEach((item) => {
        if (item.name.includes('Gazette')) {
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
            name: 'rasa_addons.nlu.components.http_logger.HttpLogger',
            model_id: model._id,
            url: `${apiHost}/log-utterance`,
        });
    }
    return yaml.dump(config);
};

const getTrainingDataInRasaFormat = (model, withSynonyms = true, intents = [], withGazette = true) => {
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
    const gazette = withGazette && model.training_data.fuzzy_gazette ? model.training_data.fuzzy_gazette.map(copyAndFilter) : [];

    return { rasa_nlu_data: { common_examples, entity_synonyms, gazette } };
};

if (Meteor.isServer) {
    export const parseNlu = async (instance, examples, nolog = true) => {
        check(instance, Object);
        check(examples, Array);
        check(nolog, Boolean);
        try {
            const client = axios.create({
                baseURL: instance.host,
                timeout: 100 * 1000,
            });
            // axiosRetry(client, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
            const requests = examples.map(({ text, lang }) => {
                const payload = Object.assign({}, { text, lang });
                const params = Object.assign({}, { nolog });
                if (instance.token) params.token = instance.token;
                const qs = queryString.stringify(params);
                const url = `${instance.host}/model/parse?${qs}`;
                return client.post(url, payload);
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
        'rasa.parse'(instance, params, nolog = true) {
            check(instance, Object);
            check(params, Array);
            check(nolog, Boolean);
            this.unblock();
            return parseNlu(instance, params, nolog);
        },

        async 'rasa.train'(projectId, instance) {
            check(projectId, String);
            check(instance, Object);
            const publishedModels = await Meteor.callWithPromise('nlu.getPublishedModelsLanguages', projectId);
            const nluModels = NLUModels.find(
                { _id: { $in: publishedModels.map(m => m._id) } },
                {
                    fields: {
                        config: 1,
                        training_data: 1,
                        language: 1,
                        logActivity: 1,
                        entity_synonyms: 1,
                        regex_features: 1,
                        fuzzy_gazette: 1,
                    },
                },
            ).fetch();

            const corePolicies = CorePolicies.findOne({ projectId }, { policies: 1 }).policies;
            const nlu = {};
            const config = {};

            try {
                const client = axios.create({
                    baseURL: instance.host,
                    timeout: 60 * 1000,
                });
                // eslint-disable-next-line no-plusplus
                for (let i = 0; i < nluModels.length; ++i) {
                    // eslint-disable-next-line no-await-in-loop
                    const { data } = await client.post('/data/convert/', {
                        data: getTrainingDataInRasaFormat(nluModels[i]),
                        output_format: 'md',
                        language: nluModels[i].language,
                    });
                    nlu[nluModels[i].language] = data;
                    config[nluModels[i].language] = `${getConfig(nluModels[i])}\n\n${corePolicies}`;
                }

                const { stories, domain } = getStoriesAndDomain(projectId);
                const payload = {
                    domain,
                    stories,
                    nlu,
                    config,
                    fixed_model_name: getProjectModelFileName(projectId),
                };
                const trainingClient = axios.create({
                    baseURL: instance.host,
                    timeout: 30 * 60 * 1000,
                    responseType: 'arraybuffer',
                });
                const trainingResponse = await trainingClient.post('/model/train', payload);

                if (trainingResponse.status === 200 && (!process.env.ORCHESTRATOR || process.env.ORCHESTRATOR === 'docker-compose')) {
                    const { headers: { filename } } = trainingResponse;
                    const trainedModelPath = path.join(getProjectModelLocalFolder(), filename);
                    try {
                        await promisify(fs.writeFile)(trainedModelPath, trainingResponse.data, 'binary');
                    } catch (e) {
                        // eslint-disable-next-line no-console
                        console.log(`Could not save trained model to ${trainedModelPath}:${e}`);
                    }
                    
                    await client.put('/model', { model_file: trainedModelPath });
                    const modelIds = getModelIdsFromProjectId(projectId);
                    ActivityCollection.update({ modelId: { $in: modelIds }, validated: true }, { $set: { validated: false } }, { multi: true });
                }
                Meteor.call('project.markTrainingStopped', projectId, 'success');
            } catch (e) {
                Meteor.call('project.markTrainingStopped', projectId, 'failure', e.reason);
                throw getAxiosError(e);
            }
        },

        'rasa.evaluate.nlu'(modelId, projectId, testData) {
            check(projectId, String);
            check(modelId, String);
            check(testData, Match.Maybe(Object));
            try {
                this.unblock();
                const model = NLUModels.findOne({ _id: modelId });
                check(model, Object);
                const examples = testData || getTrainingDataInRasaFormat(model, false);
                const params = { language: model.language };
                
                const instance = Instances.findOne({ projectId });
                if (instance.token) Object.assign(params, { token: instance.token });
                const qs = queryString.stringify(params);
                const client = axios.create({
                    baseURL: instance.host,
                    timeout: 60 * 60 * 1000,
                });

                axiosRetry(client, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
                const url = `${instance.host}/model/test/intents?${qs}`;
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

                throw error;
            }
        },
    });
}
