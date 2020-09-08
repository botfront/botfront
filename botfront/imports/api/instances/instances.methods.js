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
    formatError, getProjectModelLocalFolder, getProjectModelFileName,
} from '../../lib/utils';
import ExampleUtils from '../../ui/components/utils/ExampleUtils';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { Instances } from './instances.collection';
import { CorePolicies } from '../core_policies';
import { Evaluations } from '../nlu_evaluation';
import Activity from '../graphql/activity/activity.model';
import { getStoriesAndDomain } from '../../lib/story.utils';

const replaceMongoReservedChars = (input) => {
    if (Array.isArray(input)) return input.map(replaceMongoReservedChars);
    if (typeof input === 'object') {
        const corrected = input;
        Object.keys(input).forEach((key) => {
            const newKeyName = key.replace(/\./g, '_');
            corrected[newKeyName] = replaceMongoReservedChars(input[key]);
            if (newKeyName !== key) delete corrected[key];
        });
        return corrected;
    }
    return input;
};

export const createInstance = async (project) => {
    if (!Meteor.isServer) throw Meteor.Error(401, 'Not Authorized');

    const { instance: host } = yaml.safeLoad(
        Assets.getText(
            process.env.MODE === 'development'
                ? 'defaults/private.dev.yaml'
                : 'defaults/private.yaml',
        ),
    );

    return Instances.insert({
        name: 'Default Instance',
        host,
        projectId: project._id,
    });
};

const getConfig = (model) => {
    const config = yaml.safeLoad(model.config);
    if (!config.pipeline) {
        throw new Meteor.Error('Your NLU pipeline is empty.');
    }
    config.pipeline.forEach((item) => {
        if (item.name.includes('Gazette')) {
            if (model.training_data.fuzzy_gazette) {
                // eslint-disable-next-line no-param-reassign
                item.entities = model.training_data.fuzzy_gazette.map(
                    ({ value, mode, min_score }) => ({ name: value, mode, min_score }),
                );
            }
        }
    });
    config.language = model.language;
    return yaml.dump(config);
};

export const getTrainingDataInRasaFormat = (
    model,
    withSynonyms = true,
    intents = [],
    withGazette = true,
) => {
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
        if (intents.length === 1) {
            // there is only one intent so we add a dummy in order for the nlu to train
            common_examples.push({
                text: 'dummyazerty12345', // this is just a weird example, to  avoid user input containing "dummy " to be interpreted as dummy intent
                intent: 'dummy',
                canonical: false,
                entities: [],
            });
        }
    }
    common_examples = common_examples.sort(
        (a, b) => b.canonical || false - a.canonical || false,
    );

    const entity_synonyms = withSynonyms && model.training_data.entity_synonyms
        ? model.training_data.entity_synonyms.map(copyAndFilter)
        : [];
    const gazette = withGazette && model.training_data.fuzzy_gazette
        ? model.training_data.fuzzy_gazette.map(copyAndFilter)
        : [];

    return { rasa_nlu_data: { common_examples, entity_synonyms, gazette } };
};

if (Meteor.isServer) {
    import {
        getAppLoggerForFile,
        getAppLoggerForMethod,
        addLoggingInterceptors,
    } from '../../../server/logger';
    // eslint-disable-next-line import/order
    import { performance } from 'perf_hooks';

    const trainingAppLogger = getAppLoggerForFile(__filename);

    Meteor.methods({
        async 'rasa.parse'(instance, examples, options = {}) {
            check(instance, Object);
            check(examples, Array);
            check(options, Object);
            const { failSilently } = options;
            const appMethodLogger = getAppLoggerForMethod(
                trainingAppLogger,
                'rasa.parse',
                Meteor.userId(),
                { instance, examples },
            );
            appMethodLogger.debug('Parsing nlu');
            try {
                const client = axios.create({
                    baseURL: instance.host,
                    timeout: 100 * 1000,
                });
                addLoggingInterceptors(client, appMethodLogger);
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
                    .map(r => r.data)
                    .map((r) => {
                        if (!r.text || r.text.startsWith('/')) {
                            return {
                                text: (r.text || '').replace(/^\//, ''),
                                intent: null,
                                intent_ranking: [],
                                entities: [],
                            };
                        }
                        return r;
                    });
                if (result.length < 1 && !failSilently) throw new Meteor.Error('Error when parsing NLU');
                if (Array.from(new Set(result.map(r => r.language))).length > 1 && !failSilently) {
                    throw new Meteor.Error('Tried to parse for more than one language at a time.');
                }
                return examples.length < 2 ? result[0] : result;
            } catch (e) {
                if (failSilently) {
                    const result = examples.map(({ text }) => ({
                        text: (text || '').replace(/^\//, ''),
                        intent: null,
                        intent_ranking: [],
                        entities: [],
                    }));
                    return examples.length < 2 ? result[0] : result;
                }
                throw formatError(e);
            }
        },

        async 'rasa.convertToJson'(file, language, outputFormat, host) {
            check(file, String);
            check(language, String);
            check(outputFormat, String);
            check(host, String);
            const appMethodLogger = getAppLoggerForMethod(
                trainingAppLogger,
                'rasa.convertToJson',
                Meteor.userId(),
                {
                    file,
                    language,
                    outputFormat,
                    host,
                },
            );

            const client = axios.create({
                baseURL: host,
                timeout: 100 * 1000,
            });
            addLoggingInterceptors(client, appMethodLogger);
            const { data } = await client.post('/data/convert/', {
                data: file,
                output_format: outputFormat,
                language,
            });
            return data;
        },

        async 'rasa.getTrainingPayload'(projectId, { language = '', joinStoryFiles = true } = {}) {
            check(projectId, String);
            check(language, String);
            const instance = await Instances.findOne({ projectId });
            const appMethodLogger = getAppLoggerForMethod(
                trainingAppLogger,
                'rasa.getTrainingPayload',
                Meteor.userId(),
                { projectId, language },
            );
            const client = axios.create({
                baseURL: instance.host,
                timeout: 3 * 60 * 1000,
            });
            addLoggingInterceptors(client, appMethodLogger);

            appMethodLogger.debug('Building training payload ...');
            const t0 = performance.now();

            const corePolicies = CorePolicies.findOne({ projectId }, { policies: 1 })
                .policies;
            const nlu = {};
            const config = {};

            try {
                const { stories, domain, wasPartial } = await getStoriesAndDomain(projectId, language);
                const selectedIntents = wasPartial ? yaml.safeLoad(domain).intents : [];
                

                for (let i = 0; i < nluModels.length; ++i) {
                    const currentLang = nluModels[i].language;
                    // eslint-disable-next-line no-await-in-loop
                    const { data } = await client.post('/data/convert/', {
                        data: getTrainingDataInRasaFormat(
                            nluModels[i],
                            true,
                            selectedIntents && selectedIntents.length > 0
                                ? selectedIntents
                                : undefined,
                        ),
                        output_format: 'md',
                        language: currentLang,
                    });
                    const canonical = nluModels[i].training_data.common_examples
                        .filter(e => e.canonical)
                        .map(e => e.text);
                    const canonicalText = canonical.length
                        ? `\n\n# canonical\n- ${canonical.join('\n- ')}`
                        : '';
                    nlu[currentLang] = {
                        data: `# lang:${currentLang}${canonicalText}\n\n${data.data}`,
                    };
                    config[currentLang] = `${getConfig(nluModels[i])}\n\n${corePolicies}`;
                }

                const payload = {
                    domain,
                    stories: joinStoryFiles ? stories.join('\n') : stories,
                    nlu,
                    config,
                    fixed_model_name: getProjectModelFileName(projectId),
                };
                const t1 = performance.now();
                appMethodLogger.debug(
                    `Building training payload - ${(t1 - t0).toFixed(2)} ms`,
                );
                return payload;
            } catch (e) {
                const error = `${e.message || e.reason} ${(
                    e.stack.split('\n')[2] || ''
                ).trim()}`;
                const t1 = performance.now();
                appMethodLogger.error(
                    `Building training payload failed - ${(t1 - t0).toFixed(2)} ms`,
                    { error },
                );
                Meteor.call(
                    'project.markTrainingStopped',
                    projectId,
                    'failure',
                    e.reason,
                );
                throw formatError(e);
            }
        },

        async 'rasa.train'(projectId, instance) {
            check(projectId, String);
            check(instance, Object);
            const appMethodLogger = getAppLoggerForMethod(
                trainingAppLogger,
                'rasa.train',
                Meteor.userId(),
                { projectId, instance },
            );

            appMethodLogger.debug(`Training project ${projectId}...`);
            const t0 = performance.now();
            try {
                const client = axios.create({
                    baseURL: instance.host,
                    timeout: 3 * 60 * 1000,
                });
                addLoggingInterceptors(client, appMethodLogger);
                const payload = await Meteor.call(
                    'rasa.getTrainingPayload',
                    projectId,
                    instance,
                );
                const trainingClient = axios.create({
                    baseURL: instance.host,
                    timeout: 30 * 60 * 1000,
                    responseType: 'arraybuffer',
                });
                addLoggingInterceptors(trainingClient, appMethodLogger);
                const trainingResponse = await trainingClient.post(
                    '/model/train',
                    payload,
                );
                if (trainingResponse.status === 200) {
                    const t1 = performance.now();
                    appMethodLogger.debug(
                        `Training project ${projectId} - ${(t1 - t0).toFixed(2)} ms`,
                    );
                    const {
                        headers: { filename },
                    } = trainingResponse;
                    const trainedModelPath = path.join(
                        getProjectModelLocalFolder(),
                        filename,
                    );
                    try {
                        appMethodLogger.debug(`Saving model at ${trainedModelPath}`);
                        await promisify(fs.writeFile)(
                            trainedModelPath,
                            trainingResponse.data,
                            'binary',
                        );
                    } catch (e) {
                        const error = `${e.message || e.reason} ${(
                            e.stack.split('\n')[2] || ''
                        ).trim()}`;
                        appMethodLogger.error(
                            `Could not save trained model to ${trainedModelPath}`,
                            { error },
                        );
                    }

                    await client.put('/model', { model_file: trainedModelPath });
                    Activity.update({ projectId, validated: true }, { $set: { validated: false } }, { multi: true }).exec();
                }
                Meteor.call('project.markTrainingStopped', projectId, 'success');
            } catch (e) {
                const error = `${e.message || e.reason} ${(
                    e.stack.split('\n')[2] || ''
                ).trim()}`;
                const t1 = performance.now();
                appMethodLogger.error(
                    `Training project ${projectId} - ${(t1 - t0).toFixed(2)} ms`,
                    { error },
                );
                Meteor.call(
                    'project.markTrainingStopped',
                    projectId,
                    'failure',
                    e.reason,
                );
                throw formatError(e);
            }
        },

        'rasa.evaluate.nlu'(projectId, language, testData) {
            check(projectId, String);
            check(language, String);
            check(testData, Match.Maybe(Object));

            const appMethodLogger = getAppLoggerForMethod(
                trainingAppLogger,
                'rasa.evaluate.nlu',
                Meteor.userId(),
                { projectId, language, testData },
            );
            try {
                this.unblock();
                const model = NLUModels.findOne({ projectId, language });
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
                addLoggingInterceptors(client, appMethodLogger);
                axiosRetry(client, {
                    retries: 3,
                    retryDelay: axiosRetry.exponentialDelay,
                });
                const url = `${instance.host}/model/test/intents?${qs}`;
                let results = Promise.await(client.post(url, examples));

                results = replaceMongoReservedChars({
                    intent_evaluation: results.data.intent_evaluation || {},
                    entity_evaluation:
                        results.data.entity_evaluation.DIETClassifier || {},
                });

                const evaluations = Evaluations.findOne({ projectId, language }, { field: { _id: 1 } });
                if (!evaluations) {
                    Evaluations.update({ _id: evaluations._id }, { $set: { results: results.data } });
                } else {
                    Evaluations.insert({ results: results.data, projectId, language });
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
