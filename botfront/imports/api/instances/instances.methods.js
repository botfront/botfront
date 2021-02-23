/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { check, Match } from 'meteor/check';
import queryString from 'query-string';
import axiosRetry from 'axios-retry';
import yaml from 'js-yaml';
import axios from 'axios';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

import {
    formatError,
    getProjectModelLocalFolder,
    getProjectModelFileName,
} from '../../lib/utils';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { getExamples } from '../graphql/examples/mongo/examples';
import { Instances } from './instances.collection';
import { CorePolicies } from '../core_policies';
import { Evaluations } from '../nlu_evaluation';
import { checkIfCan } from '../../lib/scopes';
import Activity from '../graphql/activity/activity.model';
import { getFragmentsAndDomain } from '../../lib/story.utils';
import { dropNullValuesFromObject } from '../../lib/client.safe.utils';
import { Projects } from '../project/project.collection';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';

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
                : process.env.ORCHESTRATOR === 'gke'
                    ? 'defaults/private.gke.yaml'
                    : 'defaults/private.yaml',
        ),
    );

    return Instances.insert({
        name: 'Default Instance',
        host: host.replace(/{PROJECT_NAMESPACE}/g, project.namespace),
        projectId: project._id,
    });
};

export const getNluDataAndConfig = async (projectId, language, intents) => {
    const model = await NLUModels.findOne(
        { projectId, language },
        { training_data: 1, config: 1 },
    );
    if (!model) {
        throw new Error(`Could not find ${language} model for project ${projectId}.`);
    }
    const copyAndFilter = ({
        _id, mode, min_score, ...obj
    }) => obj;
    const {
        training_data: { entity_synonyms, fuzzy_gazette, regex_features },
        config,
    } = model;
    const { examples = [] } = await getExamples({
        projectId,
        language,
        intents,
        pageSize: -1,
        sortKey: 'intent',
        order: 'ASC',
    });
    const common_examples = examples.filter(e => !e?.metadata?.draft);
    const missingExamples = Math.abs(Math.min(0, common_examples.length - 2));
    for (let i = 0; (intents || []).length && i < missingExamples; i += 1) {
        common_examples.push({
            text: `${i}dummy${i}azerty${i}`,
            entities: [],
            metadata: { canonical: true, language },
            intent: `dumdum${i}`,
        });
    }

    return {
        rasa_nlu_data: {
            common_examples: common_examples.map(
                ({
                    text, intent, entities = [], metadata: { canonical, ...metadata } = {},
                }) => ({
                    text,
                    intent,
                    entities: entities.map(({ _id: _, ...rest }) => dropNullValuesFromObject(rest)),
                    metadata: {
                        ...metadata,
                        ...(canonical ? { canonical } : {}),
                    },
                }),
            ),
            entity_synonyms: entity_synonyms.map(copyAndFilter),
            gazette: fuzzy_gazette.map(copyAndFilter),
            regex_features: regex_features.map(copyAndFilter),
        },
        config: yaml.dump({
            ...yaml.safeLoad(config),
            language,
        }),
    };
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

    Meteor.methods({
        async 'rasa.parse'(instance, examples, options = {}) {
            checkIfCan('nlu-data:r', instance.projectId);
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
                    params: { token: instance.token }
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
                if (result.length < 1 && !failSilently) {
                    throw new Meteor.Error('Error when parsing NLU');
                }
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

        async 'rasa.getTrainingPayload'(
            projectId,
            { language = '', env = 'development' } = {},
        ) {
            checkIfCan(['nlu-data:x', 'projects:r', 'export:x'], projectId);
            check(projectId, String);
            check(language, String);

            const { policies: corePolicies, augmentationFactor } = CorePolicies.findOne(
                { projectId },
                { policies: 1, augmentationFactor: 1 },
            );
            const nlu = {};
            const config = {};

            const {
                stories = [], rules = [], domain, wasPartial,
            } = await getFragmentsAndDomain(
                projectId,
                language,
                env,
            );
            stories.sort((a, b) => a.story.localeCompare(b.story));
            rules.sort((a, b) => a.rule.localeCompare(b.rule));
            const selectedIntents = wasPartial
                ? yaml.safeLoad(domain).intents
                : undefined;
            let languages = [language];
            if (!language) {
                const project = Projects.findOne({ _id: projectId }, { languages: 1 });
                languages = project ? project.languages : [];
            }
            for (const lang of languages) {
                const {
                    rasa_nlu_data,
                    config: configForLang,
                } = await getNluDataAndConfig(projectId, lang, selectedIntents);
                nlu[lang] = { rasa_nlu_data };
                config[lang] = `${configForLang}\n\n${corePolicies}`;
            }
            const payload = {
                domain: yaml.safeDump(domain, { skipInvalid: true, sortKeys: true }),
                stories,
                rules,
                nlu,
                config,
                fixed_model_name: getProjectModelFileName(projectId),
                augmentation_factor: augmentationFactor,
            };
            auditLog('Retreived training payload for project', {
                user: Meteor.user(),
                type: 'execute',
                projectId,
                operation: 'nlu-model-execute',
                resId: projectId,
                resType: 'nlu-model',
            });
            return payload;
        },

        async 'rasa.train'(projectId, env = 'development') {
            checkIfCan('nlu-data:x', projectId);
            check(projectId, String);
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
                { projectId },
            );

            appMethodLogger.debug(`Training project ${projectId}...`);
            const t0 = performance.now();
            const loadModel = env === 'development';
            try {
                const {
                    stories = [],
                    rules = [],
                    ...payload
                } = await Meteor.call('rasa.getTrainingPayload', projectId, { env });
                payload.fragments = yaml.safeDump(
                    { stories, rules },
                    { skipInvalid: true },
                );
                const instance = await Instances.findOne({ projectId });
                 // this client is used when telling rasa to load a model
                const client = axios.create({
                    baseURL: instance.host,
                    timeout: process.env.TRAINING_TIMEOUT || 0,
                    params: { token: instance.token }
                });
                addLoggingInterceptors(client, appMethodLogger);
                const trainingClient = axios.create({
                    baseURL: instance.host,
                    timeout: process.env.TRAINING_TIMEOUT || 0,
                    responseType: 'arraybuffer',
                    params: { token: instance.token }
                })
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
                    }

                    Meteor.call('call.postTraining', projectId, trainingResponse.data)
                    Activity.update(
                        { projectId, validated: true },
                        { $set: { validated: false } },
                        { multi: true },
                    ).exec();
                }

                Meteor.call('project.markTrainingStopped', projectId, 'success');
            } catch (e) {
                console.log(e); // eslint-disable-line no-console
                const error = `${e.message || e.reason} ${(
                    e.stack.split('\n')[2] || ''
                ).trim()}`;
                const t1 = performance.now();
                appMethodLogger.error(
                    `Training project ${projectId} - ${(t1 - t0).toFixed(2)} ms`,
                    { error },
                );
                Meteor.call('project.markTrainingStopped', projectId, 'failure', error);
                throw formatError(e);
            }
        },

        async 'rasa.evaluate.nlu'(projectId, language, testData) {
            checkIfCan('nlu-data:x', projectId);
            check(projectId, String);
            check(language, String);
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
                { projectId, language, testData },
            );
            try {
                this.unblock();
                const examples = testData || {
                    rasa_nlu_data: (await getNluDataAndConfig(projectId, language))
                        .rasa_nlu_data,
                };
              
                const instance = Instances.findOne({ projectId });
                const client = axios.create({
                    baseURL: instance.host,
                    timeout: 60 * 60 * 1000,
                    params: { language, token: instance.token }
                });
                addLoggingInterceptors(client, appMethodLogger);
                axiosRetry(client, {
                    retries: 3,
                    retryDelay: axiosRetry.exponentialDelay,
                });
                const url = `${instance.host}/model/test/intents`;
                let results = Promise.await(client.post(url, examples));

                results = replaceMongoReservedChars({
                    intent_evaluation: results.data.intent_evaluation || {},
                    entity_evaluation:
                        results.data.entity_evaluation.DIETClassifier || {},
                });

                const evaluations = Evaluations.findOne(
                    { projectId, language },
                    { field: { _id: 1 } },
                );
                if (evaluations) {
                    Evaluations.update({ _id: evaluations._id }, { $set: { results } });
                } else {
                    Evaluations.insert({ results, projectId, language });
                }
                return 'ok';
            } catch (e) {
                throw formatError(e);
            }
        },
    });
}
