/* eslint-disable camelcase */
import { check, Match } from 'meteor/check';
import queryString from 'query-string';
import axiosRetry from 'axios-retry';
import axios from 'axios';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import {
    getAxiosError, getModelIdsFromProjectId, getProjectModelLocalFolder, getProjectModelFileName,
} from '../../lib/utils';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { Instances } from './instances.collection';
import { CorePolicies } from '../core_policies';
import { Evaluations } from '../nlu_evaluation';
import { ActivityCollection } from '../activity';
import { getStoriesAndDomain } from '../../lib/story.utils';
import { getTrainingDataInRasaFormat, getNluModelData } from './instances.utils';


if (Meteor.isServer) {
    export const parseNlu = async (instance, examples, nolog = true) => {
        check(instance, Object);
        check(examples, Array);
        check(nolog, Boolean);
        const models = NLUModels.find(
            { _id: { $in: getModelIdsFromProjectId(instance.projectId) } },
            { fields: { _id: 1, language: 1 } },
        ).fetch();

        try {
            const client = axios.create({
                baseURL: instance.host,
                timeout: 100 * 1000,
            });
            // axiosRetry(client, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
            const requests = examples.map(({ text, lang }) => {
                const payload = Object.assign({}, { text, lang });
                const params = {};
                if (instance.token) params.token = instance.token;
                const qs = queryString.stringify(params);
                const url = `${instance.host}/model/parse?${qs}`;
                return client.post(url, payload);
            });

            const result = (await axios.all(requests))
                .filter(r => r.status === 200)
                .map(r => r.data);
            
            if (result.length < 1) throw new Meteor.Error('Error when parsing NLU');

            if (!nolog) {
                result.forEach((r) => {
                    try {
                        const { _id: modelId } = models.filter(m => m.language === r.language)[0];
                        Meteor.call('activity.log', { ...r, modelId });
                    } catch (e) {
                        //
                    }
                });
            }

            if (result.length < 2) return result[0];
            return result;
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

        async 'rasa.convertToJson'(file, language, outputFormat, host) {
            check(file, String);
            check(language, String);
            check(outputFormat, String);
            check(host, String);
            const client = axios.create({
                baseURL: host,
                timeout: 100 * 1000,
            });
            const { data } = await client.post('/data/convert/', {
                data: file,
                output_format: outputFormat,
                language,
            });
            
            return data;
        },
        async 'rasa.getTrainingPayload'(projectId, instance, language = '') {
            check(projectId, String);
            check(instance, Object);
            check(language, String);
            const publishedModels = await Meteor.callWithPromise('nlu.getPublishedModelsLanguages', projectId);
            const nluModels = NLUModels.find(
                { _id: { $in: publishedModels.map(m => m._id) } },
                {
                    fields: {
                        config: 1,
                        training_data: 1,
                        language: 1,
                        entity_synonyms: 1,
                        regex_features: 1,
                        fuzzy_gazette: 1,
                    },
                },
            ).fetch();

            const corePolicies = CorePolicies.findOne({ projectId }, { policies: 1 }).policies;

            try {
                const { nlu, config } = await getNluModelData(instance, nluModels, corePolicies);
                const { stories, domain } = getStoriesAndDomain(projectId, language);
                const fixed_model_name = getProjectModelFileName(projectId);

                const payload = {
                    domain, stories, nlu, config, fixed_model_name,
                };
                return payload;
            } catch (e) {
                throw getAxiosError(e);
            }
        },

        async 'rasa.train'(projectId, instance) {
            check(projectId, String);
            check(instance, Object);
            try {
                const payload = await Meteor.callWithPromise('rasa.getTrainingPayload', projectId, instance);

                const trainingClient = axios.create({
                    baseURL: instance.host,
                    timeout: 30 * 60 * 1000,
                    responseType: 'arraybuffer',
                });
                const trainingResponse = await trainingClient.post('/model/train', payload);

                // if the request to the trainingClient was successfull: save the new model
                if (trainingResponse.status === 200) {
                    const { headers: { filename } } = trainingResponse;
                    const trainedModelPath = path.join(getProjectModelLocalFolder(), filename);
                    try {
                        await promisify(fs.writeFile)(trainedModelPath, trainingResponse.data, 'binary');
                    } catch (e) {
                        // eslint-disable-next-line no-console
                        console.log(`Could not save trained model to ${trainedModelPath}:${e}`);
                    }
                    
                    const client = axios.create({
                        baseURL: instance.host,
                        timeout: 3 * 60 * 1000,
                    });
                    await client.put('/model', { model_file: trainedModelPath });

                    const modelIds = getModelIdsFromProjectId(projectId);
                    ActivityCollection.update(
                        { modelId: { $in: modelIds }, validated: true },
                        { $set: { validated: false } }, { multi: true },
                    );
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
