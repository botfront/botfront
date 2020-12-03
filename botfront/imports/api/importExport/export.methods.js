import { Meteor } from 'meteor/meteor';
import axios from 'axios';
import _ from 'lodash';

import { check } from 'meteor/check';

import { safeDump } from 'js-yaml';
import { Endpoints } from '../endpoints/endpoints.collection';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';
import { Credentials } from '../credentials';

import { generateErrorText } from './importExport.utils';
import { checkIfCan } from '../../lib/scopes';
import { ZipFolder } from './ZipFolder';
import { Projects } from '../project/project.collection';
import { Instances } from '../instances/instances.collection';
import Conversations from '../graphql/conversations/conversations.model';
import Activity from '../graphql/activity/activity.model';

if (Meteor.isServer) {
    import {
        getAppLoggerForFile,
        getAppLoggerForMethod,
        addLoggingInterceptors,
    } from '../../../server/logger';

    const exportAppLogger = getAppLoggerForFile(__filename);
    const axiosClient = axios.create();

    const convertJsonToYaml = async (json, instanceHost, language) => {
        const { data } = await axiosClient.post(`${instanceHost}/data/convert/nlu`, {
            data: json,
            input_format: 'json',
            output_format: 'yaml',
            language,
        });
        return data.data || '';
    };

    Meteor.methods({
        exportProject(projectId, options) {
            check(projectId, String);
            check(options, Object);

            const apiHost = GlobalSettings.findOne(
                { _id: 'SETTINGS' },
                { fields: { 'settings.private.bfApiHost': 1 } },
            ).settings.private.bfApiHost;

            const appMethodLogger = getAppLoggerForMethod(
                exportAppLogger,
                'exportProject',
                Meteor.userId(),
                { apiHost, projectId, options },
            );
            const params = { ...options };
            params.output = 'json';
            const exportAxios = axios.create();
            addLoggingInterceptors(exportAxios, appMethodLogger);
            const exportRequest = exportAxios
                .get(`${apiHost}/project/${projectId}/export`, { params })
                .then(res => ({ data: JSON.stringify(res.data) }))
                .catch(err => ({
                    error: { header: 'Export Failed', text: generateErrorText(err) },
                }));

            return exportRequest;
        },
        async exportRasa(projectId, language, options) {
            checkIfCan('export:x', projectId);
            check(projectId, String);
            check(language, String);
            check(options, Object);
            const passedLang = language === 'all' ? {} : { language };

            const project = Projects.findOne({ _id: projectId });
            const hasEnvs = project.deploymentEnvironments
                && project.deploymentEnvironments.length !== 0;
            let credentials;
            let endpoints;
            let conversations;
            let incoming;

            if (hasEnvs) {
                const envs = ['development', ...project.deploymentEnvironments];
                credentials = await Promise.all(
                    envs.map(async (environment) => {
                        const creds = await Credentials.findOne(
                            { projectId, environment },
                            { fields: { credentials: 1 } },
                        );
                        return {
                            environment,
                            credentials: creds.credentials,
                        };
                    }),
                );

                endpoints = await Promise.all(
                    envs.map(async (environment) => {
                        const endpoint = await Endpoints.findOne(
                            { projectId, environment },
                            { fields: { endpoints: 1 } },
                        );
                        return {
                            environment,
                            endpoints: endpoint.endpoints,
                        };
                    }),
                );
                if (options.incoming) {
                    incoming = await Promise.all(
                        envs.map(async (environment) => {
                            const incomingInEnv = await Activity.find({
                                projectId,
                                environment,
                            }).lean();
                            return {
                                environment,
                                incoming: incomingInEnv,
                            };
                        }),
                    );
                }
                if (options.conversations) {
                    conversations = await Promise.all(
                        envs.map(async (environment) => {
                            const conversationsInEnv = await Conversations.find({
                                projectId,
                                environment,
                            }).lean();
                            return {
                                environment,
                                conversations: conversationsInEnv,
                            };
                        }),
                    );
                }
            } else {
                credentials = await Credentials.findOne(
                    { projectId },
                    { fields: { credentials: 1 } },
                ).credentials;
                endpoints = await Endpoints.findOne(
                    { projectId },
                    { fields: { endpoints: 1 } },
                ).endpoints;
                if (options.incoming) {
                    incoming = await Activity.find({ projectId }, { _id: 0 }).lean();
                }
                if (options.conversations) {
                    conversations = await Conversations.find({ projectId }).lean();
                }
            }

            const rasaData = await Meteor.callWithPromise(
                'rasa.getTrainingPayload',
                projectId,
                { ...passedLang },
            );

            const fragmentsByGroup = _.chain([...rasaData.stories, ...rasaData.rules])
                .groupBy(({ metadata: { group } } = {}) => group)
                .map((fragments, group) => ({ group, fragments }))
                .value()
                .map(({ fragments, group }) => {
                    const stories = fragments.filter(f => f.story);
                    const rules = fragments.filter(f => f.rule);
                    const fragmentsByType = safeDump(
                        { stories, rules },
                        { skipInvalid: true },
                    );
                    return { group, fragments: fragmentsByType };
                });
            const exportData = {
                config:
                    language === 'all'
                        ? rasaData.config
                        : { [language]: rasaData.config[language] },
                domain: rasaData.domain,
                nlu:
                    language === 'all'
                        ? rasaData.nlu
                        : { [language]: rasaData.nlu[language] },
                fragments: fragmentsByGroup,
            };

            const defaultDomain = project?.defaultDomain?.content || '';
            const configData = project;
            // exported separately
            delete configData.defaultDomain;
            // all of those are state data we don't want to keep in the import
            delete configData.training;
            delete configData.disabled;
            delete configData.enableSharing;
            delete configData._id;
            delete configData.defaultDomain;
            delete configData.storyGroups;
            delete configData.languages;
            delete configData.nlu_models;
            delete configData.updatedAt;
            delete configData.deploymentEnvironments;
            const instance = await Instances.findOne({ projectId });
            delete instance._id;
            const bfconfig = { ...configData, instance };
            const bfconfigYaml = safeDump(bfconfig);

            const rasaZip = new ZipFolder();
            if (exportData.fragments.length > 1) {
                exportData.fragments.forEach(f => rasaZip.addFile(
                    f.fragments,
                    `data/stories/${f.group.replace(/ /g, '_').toLowerCase()}.yml`,
                ));
            } else if (exportData.fragments.length === 1) {
                rasaZip.addFile(exportData.fragments[0].fragments, 'data/stories.yml');
            }
            const languages = Object.keys(exportData.config);
            languages.forEach(l => rasaZip.addFile(
                exportData.config[l],
                languages.length > 1 ? `config-${l}.yml` : 'config.yml',
            ));
            // eslint-disable-next-line no-restricted-syntax
            for (const l of languages) {
                let data;
                let extension;
                try {
                    if (Meteor.isTest) throw new Error(); // keep json for export test
                    // eslint-disable-next-line no-await-in-loop
                    data = await convertJsonToYaml(exportData.nlu[l], instance.host, l);
                    extension = 'yml';
                } catch {
                    data = JSON.stringify(exportData.nlu[l], null, 2);
                    extension = 'json';
                }
                rasaZip.addFile(
                    data,
                    languages.length > 1
                        ? `data/nlu/${l}.${extension}`
                        : `data/nlu.${extension}`,
                );
            }

            if (hasEnvs) {
                endpoints.forEach((endpoint) => {
                    rasaZip.addFile(
                        endpoint.endpoints,
                        `endpoints.${endpoint.environment}.json`,
                    );
                });
                credentials.forEach((credential) => {
                    rasaZip.addFile(
                        credential.credentials,
                        `credentials.${credential.environment}.json`,
                    );
                });
                if (conversations) {
                    conversations.forEach(
                        ({ conversations: conversationsPerEnv, environment }) => {
                            rasaZip.addFile(
                                JSON.stringify(conversationsPerEnv, null, 2),
                                `conversations.${environment}.json`,
                            );
                        },
                    );
                }
                if (incoming) {
                    incoming.forEach(({ incoming: incomingPerEnv, environment }) => {
                        rasaZip.addFile(
                            JSON.stringify(incomingPerEnv, null, 2),
                            `incoming.${environment}.json`,
                        );
                    });
                }
            } else {
                rasaZip.addFile(endpoints, 'endpoints.yml');
                rasaZip.addFile(credentials, 'credentials.yml');
                if (conversations) {
                    rasaZip.addFile(
                        JSON.stringify(conversations, null, 2),
                        'botfront/conversations.json',
                    );
                }
                if (incoming) {
                    rasaZip.addFile(
                        JSON.stringify(incoming, null, 2),
                        'botfront/incoming.json',
                    );
                }
            }

            rasaZip.addFile(exportData.domain, 'domain.yml');
            rasaZip.addFile(bfconfigYaml, 'botfront/bfconfig.yml');
            rasaZip.addFile(defaultDomain, 'botfront/default-domain.yml');

            return rasaZip.generateBlob();
        },
    });
}
