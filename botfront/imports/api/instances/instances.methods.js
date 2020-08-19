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
    formatError, getModelIdsFromProjectId, uploadFileToGcs, getProjectModelLocalFolder, getProjectModelFileName, getProjectIdFromModelId,
} from '../../lib/utils';
import ExampleUtils from '../../ui/components/utils/ExampleUtils';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { Instances } from './instances.collection';
import { CorePolicies } from '../core_policies';
import { Evaluations } from '../nlu_evaluation';
import { checkIfCan } from '../../lib/scopes';
import { Projects } from '../project/project.collection';
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
                : process.env.MODE === 'test' ? 'defaults/private.yaml' : 'defaults/private.gke.yaml',
        ),
    );

    return Instances.insert({
        name: 'Default Instance',
        host: host.replace(/{PROJECT_NAMESPACE}/g, project.namespace),
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
    checkIfCan('nlu-data:r', getProjectIdFromModelId(model._id));
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
        auditLog,
    } from '../../../server/logger';
    // eslint-disable-next-line import/order
    import { performance } from 'perf_hooks';

    const trainingAppLogger = getAppLoggerForFile(__filename);

    export const parseNlu = async (instance, examples, options = {}) => {
        checkIfCan('nlu-data:r', instance.projectId);
        check(instance, Object);
        check(examples, Array);
        check(options, Object);
        const { failSilently } = options;
        let userId;
        try {
            userId = Meteor.userId();
        } catch (error) {
            userId = 'Can not get userId here';
        }
        const appMethodLogger = getAppLoggerForMethod(
            trainingAppLogger,
            'parseNlu',
            userId,
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
                    if (!r.text || !r.text.startsWith('/')) return r;
                    return {
                        text: r.text.replace(/^\//, ''),
                        intent: null,
                        intent_ranking: [],
                        entities: [],
                    };
                });
            if (result.length < 1 && !failSilently) { throw new Meteor.Error('Error when parsing NLU'); }
            if (
                Array.from(new Set(result.map(r => r.language))).length > 1
                && !failSilently
            ) {
                throw new Meteor.Error(
                    'Tried to parse for more than one language at a time.',
                );
            }

            return examples.length < 2 ? result[0] : result;
        } catch (e) {
            if (failSilently) return {};
            throw formatError(e);
        }
    };

    Meteor.methods({
        'rasa.parse'(instance, params, options = {}) {
            checkIfCan('nlu-data:r', instance.projectId);
            check(instance, Object);
            check(params, Array);
            check(options, Object);
            this.unblock();
            return parseNlu(instance, params, options);
        },

        async 'rasa.convertToJson'(file, language, outputFormat, host, projectId) {
            checkIfCan('projects:w', projectId);
            check(projectId, String);
            check(language, String);
            check(file, String);
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
            auditLog('Converted model to json', {
                user: Meteor.user(),
                type: 'updated',
                projectId,
                operation: 'rasa-execute',
                resType: 'rasa',
            });
            return data;
        },
        async 'rasa.getTrainingPayload'(
            projectId,
            instance,
            { env = 'development', language = '', joinStoryFiles = true } = {},
        ) {
            checkIfCan(['nlu-data:x', 'projects:r'], projectId);
            check(projectId, String);
            check(language, String);
            check(instance, Object);
            const modelIds = await getModelIdsFromProjectId(projectId);
            const appMethodLogger = getAppLoggerForMethod(
                trainingAppLogger,
                'rasa.getTrainingPayload',
                Meteor.userId(),
                { projectId, instance, language },
            );

            appMethodLogger.debug('Building training payload ...');
            const t0 = performance.now();
            const nluModels = NLUModels.find(
                { _id: { $in: modelIds } },
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

            const corePolicies = CorePolicies.findOne({ projectId }, { policies: 1 })
                .policies;
            const nlu = {};
            const config = {};

            try {
                const client = axios.create({
                    baseURL: instance.host,
                    timeout: 3 * 60 * 1000,
                });
                addLoggingInterceptors(client, appMethodLogger);
                const { stories, domain, wasPartial } = await getStoriesAndDomain(
                    projectId,
                    language,
                    env,
                );
                let selectedIntents = [];
                if (wasPartial) {
                    selectedIntents = yaml.safeLoad(domain).intents;
                }
                // eslint-disable-next-line no-plusplus
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
                auditLog('Retreived training payload for project', {
                    user: Meteor.user(),
                    type: 'execute',
                    projectId,
                    operation: 'nlu-model-execute',
                    resId: projectId,
                    resType: 'nlu-model',
                });
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

        async 'rasa.train'(projectId, instance, env = 'development', loadModel = true) {
            checkIfCan('nlu-data:x', projectId);
            check(projectId, String);
            check(instance, Object);
         
            auditLog('Trained project', {
                user: Meteor.user(),
                projectId,
                type: 'execute',
                operation: 'nlu-model-trained',
                resId: projectId,
                resType: 'nlu-model',
            });
            const appMethodLogger = getAppLoggerForMethod(
                trainingAppLogger,
                'rasa.train',
                Meteor.userId(),
                { projectId, instance },
            );

            appMethodLogger.debug(`Training project ${projectId}...`);
            const t0 = performance.now();
            try {
                const licenseStatus = await Meteor.call('checkLicense');
                if (licenseStatus === 'expired') {
                    throw new Meteor.Error(500, 'License expired');
                }
                const client = axios.create({
                    baseURL: instance.host,
                    timeout: 3 * 60 * 1000,
                });
                addLoggingInterceptors(client, appMethodLogger);
                const payload = await Meteor.call(
                    'rasa.getTrainingPayload',
                    projectId,
                    instance,
                    { env },
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

                    if (loadModel) {
                        await client.put('/model', { model_file: trainedModelPath });
                        if (process.env.ORCHESTRATOR === 'gke') {
                            const { modelsBucket } = Projects.findOne({ _id: projectId }, { fields: { modelsBucket: 1 } }) || {};
                            if (modelsBucket) {
                                await uploadFileToGcs(trainedModelPath, modelsBucket);
                            }
                        }
                    }
                    const modelIds = getModelIdsFromProjectId(projectId);
                    Activity.update(
                        { modelId: { $in: modelIds }, validated: true },
                        { $set: { validated: false } },
                        { multi: true },
                    ).exec();
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


        'rasa.evaluate.nlu'(modelId, projectId, testData) {
            checkIfCan('nlu-data:x', projectId);
            check(projectId, String);
            check(modelId, String);
            check(testData, Match.Maybe(Object));
            auditLog('Evaluated nlu data', {
                user: Meteor.user(),
                projectId,
                type: 'execute',
                operation: 'nlu-model-evaluate',
                resId: projectId,
                resType: 'nlu-model',
            });
            const appMethodLogger = getAppLoggerForMethod(
                trainingAppLogger,
                'rasa.evaluate.nlu',
                Meteor.userId(),
                { modelId, projectId, testData },
            );
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

                const evaluations = Evaluations.find(
                    { modelId },
                    { field: { _id: 1 } },
                ).fetch();
                if (evaluations.length > 0) {
                    Evaluations.update(
                        { _id: evaluations[0]._id },
                        { $set: { results } },
                    );
                } else Evaluations.insert({ results, modelId });
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
