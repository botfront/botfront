/* eslint-disable global-require */
import { Meteor } from 'meteor/meteor';
import axios from 'axios';
import _ from 'lodash';

import { check } from 'meteor/check';
import { safeDump } from 'js-yaml';
import { Endpoints } from '../endpoints/endpoints.collection';
import { Credentials } from '../credentials';

import { checkIfCan } from '../../lib/scopes';
import { ZipFolder } from './ZipFolder';
import { Projects } from '../project/project.collection';
import { Instances } from '../instances/instances.collection';
import Conversations from '../graphql/conversations/conversations.model';
import Activity from '../graphql/activity/activity.model';

if (Meteor.isServer) {
    const md5 = require('md5');
    const glob = require('glob');
    const { join, dirname } = require('path');
    const nodegit = require('nodegit');
    const fs = require('fs');
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

    const deletePathsNotInZip = (dir, zip, exclusions) => Promise.all(
        glob.sync(join('**', '*'), { cwd: dir }).map((path) => {
            if (exclusions.includes(path)) return Promise.resolve();
            if (fs.statSync(join(dir, path)).isDirectory()) {
                if (`${path}/` in zip.files) return Promise.resolve();
                return fs.promises.rmdir(join(dir, path));
            }
            if (path in zip.files) return Promise.resolve();
            return fs.promises.unlink(join(dir, path));
        }),
    );

    const extractZip = (dir, zip) => Promise.all(
        Object.entries(zip.files).map(async ([path, item]) => {
            const currentDir = join(dir, dirname(path));
            if (!fs.existsSync(currentDir)) {
                fs.mkdirSync(currentDir, { recursive: true });
            }
            if (item.dir) return Promise.resolve();
            return fs.promises.writeFile(join(dir, path), await item.async('text'));
        }),
    );

    Meteor.methods({
        async commitAndPushToRemote(projectId) {
            check(projectId, String);
            const { gitString } = Projects.findOne({ _id: projectId }, { gitString: 1 }) || {};
            if (!gitString) return;
            const [url, branch, ...rest] = gitString.split('#');
            if (rest.length || !branch) {
                throw new Error('There\'s something wrong with your git https string.');
            }
            const dir = `${md5(url)}`;

            // we start with a fresh clone every time (no fetch/merge)
            // to do so, we need to delete dir from previous clone
            if (fs.existsSync(dir)) fs.rmdirSync(dir, { recursive: true });

            let repo;
            let headCommit;
            let remote;
            try {
                // no support for shallow clones yet
                // https://github.com/libgit2/libgit2/issues/3058
                repo = await nodegit.Clone.clone(url, dir);
                headCommit = await repo.getBranchCommit(branch);
                remote = await repo.getRemote('origin');
            } catch {
                throw new Error(
                    `Could not connect to branch '${branch}' on your git repo. Check your credentials.`,
                );
            }

            const bfIgnoreFile = join(dir, '.bfignore');
            const exclusions = [
                bfIgnoreFile,
                ...(fs.existsSync(bfIgnoreFile)
                    ? fs.readFileSync(bfIgnoreFile, 'utf-8').split('\n')
                    : []),
            ];

            // given that the present method is called on training, calling 'exportRasa'
            // here means 'rasa.getTrainingPayload' will be called twice in short succession,
            // which is a bit stupid, but we live with it for now.
            const zip = await Meteor.callWithPromise('exportRasa', projectId, 'all', {
                noBlob: true,
            });
            await deletePathsNotInZip(dir, zip, exclusions); // deletions
            await extractZip(dir, zip); // additions/modifications

            const index = await repo.index();
            index.read(1);
            await index.addAll();
            await index.write();
            const signature = nodegit.Signature.create(
                'Botfront',
                'git@botfront.io',
                Date.now() / 1000,
                60,
            );
            const oid = await repo.createCommit(
                'HEAD',
                signature,
                signature,
                `${new Date()}`,
                await index.writeTree(),
                [headCommit.id().tostrS()],
            );
            const commit = await repo.getCommit(oid);
            const diff = await (await commit.getTree()).diff(await headCommit.getTree());
            // only push if commit contains changes
            if (diff.numDeltas() > 0) {
                await remote.push([`refs/heads/${branch}:refs/heads/${branch}`]);
            }
        },
        async exportRasa(projectId, language, options) {
            checkIfCan('export:x', projectId);
            check(projectId, String);
            check(language, String);
            check(options, Object);
            const passedLang = language === 'all' ? {} : { language };

            const project = Projects.findOne({ _id: projectId }, { gitString: 0 });
            const envs = ['development', ...(project.deploymentEnvironments || [])];
            const getEnvQuery = (envKey, envValue) => (envValue !== 'development'
                ? { [envKey]: envValue }
                : {
                    $or: [{ [envKey]: envValue }, { [envKey]: { $exists: false } }],
                });

            const credentials = await Promise.all(
                envs.map(async (environment) => {
                    const creds = await Credentials.findOne(
                        { projectId, ...getEnvQuery('environment', environment) },
                        { fields: { credentials: 1 } },
                    );
                    return {
                        environment,
                        credentials: creds.credentials,
                    };
                }),
            );
            const endpoints = await Promise.all(
                envs.map(async (environment) => {
                    const endpoint = await Endpoints.findOne(
                        { projectId, ...getEnvQuery('environment', environment) },
                        { fields: { endpoints: 1 } },
                    );
                    return {
                        environment,
                        endpoints: endpoint.endpoints,
                    };
                }),
            );
            const incoming = options.incoming
                && (await Promise.all(
                    envs.map(async (environment) => {
                        const incomingInEnv = await Activity.find(
                            {
                                projectId,
                                ...getEnvQuery('env', environment),
                            },
                            { _id: 0 },
                            { sort: { updatedAt: -1, language: 1 } },
                        ).lean();
                        return {
                            environment,
                            incoming: incomingInEnv,
                        };
                    }),
                ));
            const conversations = options.conversations
                && (await Promise.all(
                    envs.map(async (environment) => {
                        const conversationsInEnv = await Conversations.find(
                            {
                                projectId,
                                ...getEnvQuery('env', environment),
                            },
                            {},
                            { sort: { updatedAt: -1, language: 1 } },
                        ).lean();
                        return {
                            environment,
                            conversations: conversationsInEnv,
                        };
                    }),
                ));

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
            const widgetSettings = project?.chatWidgetSettings || {};

            const configData = project;
            // exported separately
            delete configData.chatWidgetSettings;
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

            const envSuffix = (env, collection) => (collection.length > 1 ? `.${env}` : '');

            endpoints.forEach(({ endpoints: endpointsPerEnv, environment }) => {
                rasaZip.addFile(
                    endpointsPerEnv,
                    `endpoints${envSuffix(environment, endpoints)}.yml`,
                );
            });
            credentials.forEach(({ credentials: credentialsPerEnv, environment }) => {
                rasaZip.addFile(
                    credentialsPerEnv,
                    `credentials${envSuffix(environment, credentials)}.yml`,
                );
            });
            (conversations || []).forEach(
                ({ conversations: conversationsPerEnv, environment }) => {
                    rasaZip.addFile(
                        JSON.stringify(conversationsPerEnv, null, 2),
                        `botfront/conversations${envSuffix(
                            environment,
                            conversations,
                        )}.json`,
                    );
                },
            );
            (incoming || []).forEach(({ incoming: incomingPerEnv, environment }) => {
                rasaZip.addFile(
                    JSON.stringify(incomingPerEnv, null, 2),
                    `botfront/incoming${envSuffix(environment, incoming)}.json`,
                );
            });

            rasaZip.addFile(exportData.domain, 'domain.yml');
            rasaZip.addFile(bfconfigYaml, 'botfront/bfconfig.yml');
            rasaZip.addFile(defaultDomain, 'botfront/default-domain.yml');
            if (Object.keys(widgetSettings).length > 0) {
                rasaZip.addFile(safeDump(widgetSettings), 'botfront/widgetsettings.yml');
            }

            if (options.noBlob) return rasaZip.zipContainer;
            return rasaZip.generateBlob();
        },
    });
}
