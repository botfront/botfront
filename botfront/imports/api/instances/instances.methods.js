import axios from 'axios';
import { check, Match } from 'meteor/check';
import queryString from 'query-string';
import axiosRetry from 'axios-retry';
import { Instances } from './instances.collection';
import { getTrainingDataInRasaFormat, getConfig } from '../../lib/nlu_methods';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { getAxiosError } from '../../lib/utils';
import { extractDomain, StoryValidator } from '../../lib/story_validation.js';
import { StoryGroups } from '../storyGroups/storyGroups.collection.js';
import { Evaluations } from '../nlu_evaluation';

export const createInstance = async (project) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');
    if (!process.env.ORCHESTRATOR) {
        process.env.ORCHESTRATOR = 'docker-compose';
    }

    try {
        const { getDefaultInstance } = await import(`./instances.${process.env.ORCHESTRATOR}`);
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
        throw new Error('Could not cªreate default instance', e);
    }
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
            console.log(e);
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

        async 'rasa.train'(nluModelId, projectId, instance) {
            check(nluModelId, String);
            check(projectId, String);
            check(instance, Object);
            const publishedModels = await Meteor.callWithPromise('nlu.getPublishedModelsLanguages', projectId);
            const nluModels = NLUModels.find({ _id: { $in: publishedModels.map(m => m._id) } }, {
                fields: {
                    config: 1, training_data: 1, language: 1, logActivity: 1,
                },
            }).fetch();
            const nlu = {};
            const config = {};
            const client = axios.create({
                baseURL: instance.host,
                timeout: 100 * 1000,
            });
            try {
                // eslint-disable-next-line no-plusplus
                for (let i = 0; i < nluModels.length; ++i) {
                    // eslint-disable-next-line no-await-in-loop
                    const { data } = await client.post('/data/convert/', {
                        data: getTrainingDataInRasaFormat(nluModels[i]),
                        output_format: 'md',
                        language: nluModels[i].language,
                    });
                    nlu[nluModels[i].language] = data;
                    config[nluModels[i].language] = getConfig(nluModels[i], instance);
                }

                const domain = 'intents:\n- basics.yes\nactions:\n- utter_yes\ntemplates:\n  utter_yes:\n  - text: "yes"';
                const stories = '## story\n* basics.yes\n- utter_yes';

                const payload = {
                    domain,
                    // domain: '',
                    stories,
                    nlu,
                    config,
                    out: '../_project/models',
                    // force: true,
                };

                await client.post('/model/train', payload);
                Meteor.call('nlu.markTrainingStopped', nluModelId, 'success');
            } catch (e) {
                Meteor.call('nlu.markTrainingStopped', nluModelId, 'failure', e.reason);
                throw getAxiosError(e);
            }
        },

        'rasa.evaluate.nlu'(modelId, projectId, instance, testData) {
            check(projectId, String);
            check(modelId, String);
            check(instance, Object);
            check(testData, Match.Maybe(Object));
            try {
                this.unblock();
                const model = NLUModels.findOne({ _id: modelId });
                check(model, Object);
                const examples = testData || getTrainingDataInRasaFormat(model, false);
                const params = { language: model.language };
                if (instance.token) Object.assign(params, { token: instance.token });
                const qs = queryString.stringify(params);
                const client = axios.create({
                    baseURL: instance.host,
                    timeout: 60 * 60 * 1000,
                });

                axiosRetry(client, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
                const url = `${instance.host}/model/test/intents?${qs}`;
                const results = Promise.await(client.post(url, examples));
                console.log(results);
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
        'viewStoryExceptions'(story) {
            check(story, String);
            const val = new StoryValidator(story);
            val.validateStories();
            return val.exceptions.map(exception => ({
                line: exception.line,
                code: exception.code
            }));
        },
        // eslint-disable-next-line meteor/audit-argument-checks
        'extractDomainFromStories'(storyGroup) {
            StoryGroups.simpleSchema().validate(storyGroup, { check });
            return extractDomain(storyGroup);
        },
    });
}
