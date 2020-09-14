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
import Activity from '../graphql/activity/activity.model';
import { getStoriesAndDomain } from '../../lib/story.utils';
import { Projects } from '../project/project.collection';

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
        sortKey: 'metadata.canonical',
        order: 'DESC',
    });
    const common_examples = examples.filter(e => !e?.metadata?.draft);
    const missingExamples = Math.abs(Math.min(0, common_examples.length - 2));
    for (let i = 0; (intents || []).length && i < missingExamples; i += 1) {
        common_examples.push({
            text: `${i}dummy++azerty${i}`,
            entities: [],
            metadata: { canonical: true, language },
            intent: `dumdum${i}`,
        });
    }

    return {
        rasa_nlu_data: {
            common_examples: common_examples.map(
                ({
                    text, intent, entities = [], metadata = {},
                }) => ({
                    text,
                    intent,
                    entities,
                    metadata,
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

        async 'rasa.getTrainingPayload'(
            projectId,
            { language = '', joinStoryFiles = true } = {},
        ) {
            check(projectId, String);
            check(language, String);
            const instance = await Instances.findOne({ projectId });
            const client = axios.create({
                baseURL: instance.host,
                timeout: 3 * 60 * 1000,
            });

            const corePolicies = CorePolicies.findOne({ projectId }, { policies: 1 })
                .policies;
            const nlu = {};
            const config = {};

            const { stories, domain, wasPartial } = await getStoriesAndDomain(
                projectId,
                language,
            );
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
                const { data: result } = await client.post('/data/convert/', {
                    data: { rasa_nlu_data },
                    output_format: 'md',
                    language: lang,
                });
                const canonical = rasa_nlu_data.common_examples
                    .filter(e => e.canonical)
                    .map(e => e.text);
                const canonicalText = canonical.length
                    ? `\n\n# canonical\n- ${canonical.join('\n- ')}`
                    : '';
                nlu[lang] = {
                    data: `# lang:${lang}${canonicalText}\n\n${result.data}`,
                };
                config[lang] = `${configForLang}\n\n${corePolicies}`;
            }

            const payload = {
                domain,
                stories: joinStoryFiles ? stories.join('\n') : stories,
                nlu,
                config,
                fixed_model_name: getProjectModelFileName(projectId),
            };
            return payload;
        },

        async 'rasa.train'(projectId) {
            check(projectId, String);
            const appMethodLogger = getAppLoggerForMethod(
                trainingAppLogger,
                'rasa.train',
                Meteor.userId(),
                { projectId },
            );

            appMethodLogger.debug(`Training project ${projectId}...`);
            const t0 = performance.now();
            try {
                const payload = await Meteor.call('rasa.getTrainingPayload', projectId);
                const instance = await Instances.findOne({ projectId });
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

                    await trainingClient.put('/model', { model_file: trainedModelPath });
                    Activity.update(
                        { projectId, validated: true },
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
                Meteor.call('project.markTrainingStopped', projectId, 'failure', error);
                throw formatError(e);
            }
        },

        async 'rasa.evaluate.nlu'(projectId, language, testData) {
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
                const examples = testData || {
                    rasa_nlu_data: (await getNluDataAndConfig(projectId, language))
                        .rasa_nlu_data,
                };
                const params = { language };

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

                const evaluations = Evaluations.findOne(
                    { projectId, language },
                    { field: { _id: 1 } },
                );
                if (evaluations) {
                    Evaluations.update(
                        { _id: evaluations._id },
                        { $set: { results } },
                    );
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
