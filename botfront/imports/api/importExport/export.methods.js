/* eslint-disable global-require */
import { Meteor } from 'meteor/meteor';
import axios from 'axios';
import _ from 'lodash';

import { check, Match } from 'meteor/check';
import { safeDump } from 'js-yaml';
import AnalyticsDashboards from '../graphql/analyticsDashboards/analyticsDashboards.model';
import { Endpoints } from '../endpoints/endpoints.collection';
import { Credentials } from '../credentials';
import FormResults from '../graphql/forms/form_results.model';
import { Stories } from '../story/stories.collection';
import { StoryGroups } from '../storyGroups/storyGroups.collection';
import { checkIfCan } from '../../lib/scopes';

import { createAxiosForRasa } from '../../lib/utils';
import { ZipFolder } from './ZipFolder';
import { Projects } from '../project/project.collection';
import { Instances } from '../instances/instances.collection';
import Conversations from '../graphql/conversations/conversations.model';
import Activity from '../graphql/activity/activity.model';
import { importSteps } from '../graphql/project/import.utils';

import { formatTestCaseForRasa } from '../../lib/test_case.utils';

if (Meteor.isServer) {
    const md5 = require('md5');
    const glob = require('glob');
    const { join, dirname, basename } = require('path');
    const fs = require('fs');
    
    const nodegitTry = async (callback, ...args) => {
        let result = null
        try {
            result = await callback(...args)
        } catch (e) {
            if (process.env.MODE === 'development') {
                console.info(e)
            }
        }
        return result
    }

    const signature = () => {
        const nodegit = require('nodegit');
        const {
            emails: [{ address: email = '' } = {}] = [],
            profile: { firstName = '', lastName = '' } = {},
        } = Meteor.user() || {};
        const name = [firstName, lastName].join(' ').trim();
        return nodegit.Signature.create(
            name || 'Botfront',
            email || 'git@botfront.io',
            Date.now() / 1000,
            60,
        );
    };

    const convertJsonToYaml = async (projectId, json, language) => {
        const axiosClient = await createAxiosForRasa(projectId);
        const { data } = await axiosClient.post('/data/convert/nlu', {
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
                return fs.promises.rmdir(join(dir, path), {
                    recursive: true,
                });
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

    const hardResetToCommit = async (repo, commit, branch = null) => {
        const nodegit = require('nodegit');
        await nodegit.Reset.reset(repo, commit, nodegit.Reset.TYPE.HARD, {});
        if (branch) await repo.setHead(branch.name());
    };

    const getConnectionOpts = (url, publicKey, privateKey) => {
        const nodegit = require('nodegit');
        const opts = {
            fetchOpts: {
                callbacks: { certificateCheck: () => 1 },
            },
        };
        if (url.includes('https')) return opts;
        opts.fetchOpts.callbacks.credentials = (__, userName) => nodegit.Cred.sshKeyMemoryNew(userName, publicKey, privateKey, '');
        return opts;
    };

    const setCurrentBranch = async (repo, branchName) => {
        const currentBranch = await repo.getCurrentBranch()
        if (currentBranch.name() === `refs/heads/${branchName}`) return

        const nodegit = require('nodegit')
        const branchCommit = await repo.getBranchCommit(`origin/${branchName}`);
        try {
            // check if the branch exists locally
            await nodegit.Branch.lookup(repo, branchName, 1)
        } catch {
            // If the branch does not exist locally create it
            await repo.createBranch(branchName, branchCommit)
            const localBranch = await repo.getBranch(branchName)
            await nodegit.Branch.setUpstream(localBranch, `origin/${branchName}`)
        }
        await repo.checkoutBranch(branchName)
    }

    const getRemote = async (projectId, forceClone = false) => {
        const nodegit = require('nodegit');
        const { gitSettings: { gitString = '', publicSshKey = '', privateSshKey = '' } } = Projects.findOne(
            { _id: projectId },
            { gitSettings: 1 },
        ) || {};
        const [url, branchName, ...rest] = gitString.split('#');
        const opts = getConnectionOpts(url, publicSshKey, privateSshKey);
        if (rest.length || !branchName) {
            throw new Meteor.Error(
                'There\'s something wrong with your git connection string.',
            );
        }
        const dir = `/tmp/${md5(url)}`;

        let repo;
        let branch;
        let branchCommit;
        let remote;
        try {
            try {
                if (forceClone) throw new Error();
                repo = await nodegit.Repository.open(dir);
                await repo.fetch('origin');
                await setCurrentBranch(repo, branchName)
                await repo.mergeBranches(
                    branchName,
                    `refs/remotes/origin/${branchName}`,
                    signature(),
                    nodegit.Merge.PREFERENCE.FASTFORWARD_ONLY,
                    { fileFavor: nodegit.Merge.FILE_FAVOR.THEIRS },
                );
                const localSha = (await repo.getBranchCommit(branchName)).id().tostrS();
                const remoteSha = (
                    await repo.getBranchCommit(`refs/remotes/origin/${branchName}`)
                )
                    .id()
                    .tostrS();
                // local is ahead, start from scratch
                if (localSha !== remoteSha) throw new Error();
            } catch (e) {
                if (process.env.MODE === 'development') {
                    console.info(e)
                }
                if (fs.existsSync(dir)) fs.rmdirSync(dir, { recursive: true });
                repo = await nodegit.Clone.clone(url, dir, opts);
                await setCurrentBranch(repo, branchName)
            }
            branch = await repo.getBranch(branchName);
            branchCommit = await repo.getBranchCommit(branchName);
            remote = await repo.getRemote('origin');
        } catch (e) {
            if (process.env.MODE === 'development') {
                console.info(e)
            }
            throw new Meteor.Error(
                `Could not connect to branch '${branchName}' on your git repo. Check your credentials.`,
            );
        }
        const index = await repo.index();
        await index.read(1);

        const bfIgnoreFile = join(dir, '.bfignore');
        const exclusions = [
            '.bfignore',
            ...(fs.existsSync(bfIgnoreFile)
                ? fs.readFileSync(bfIgnoreFile, 'utf-8').split('\n')
                : []),
        ];

        return {
            url,
            branchName,
            dir,
            index,
            repo,
            branch,
            branchCommit,
            remote,
            exclusions,
            opts,
        };
    };

    const repoDirToFileList = async (dir, exclusions) => glob.sync(join('**', '*'), { cwd: dir, nodir: true }).reduce(
        (files, path) => [
            ...files,
            ...(exclusions.includes(path)
                ? []
                : [
                    {
                        createReadStream: () => fs.createReadStream(join(dir, path)),
                        filename: basename(path),
                    },
                ]),
        ],
        [],
    );

    const commitChanges = async (projectId, commitMessage, { status, ...repoInfo }) => {
        const nodegit = require('nodegit');
        const {
            dir, index, repo, branchCommit, exclusions,
        } = repoInfo;
        // given that the present method is called on training, calling 'exportRasa'
        // here means 'rasa.getTrainingPayload' will be called twice in short succession,
        // which is a bit stupid, but we live with it for now.
        const zip = await Meteor.callWithPromise('exportRasa', projectId, 'all', {
            noBlob: true,
        });
        await deletePathsNotInZip(dir, zip, exclusions); // deletions
        await extractZip(dir, zip); // additions/modifications

        await index.addAll();
        await index.write();
        const oid = await index.writeTree();
        const diff = await nodegit.Diff.treeToIndex(
            repo,
            await branchCommit.getTree(),
            index,
        );
        // only push if commit contains changes
        if (diff.numDeltas() < 1) {
            await index.clear();
            return { ...repoInfo, status: { code: 204, msg: 'Nothing to push.' } };
        }
        result = await repo.createCommit(
            'HEAD',
            signature(),
            signature(),
            commitMessage || `${new Date()}`,
            oid,
            [(await repo.head()).target()],
        );
        return repoInfo;
    };

    const pushToRemote = async ({
        remote,
        branch,
        index,
        repo,
        branchCommit,
        opts: { fetchOpts: pushOpts },
    }) => {
        try {
            await remote.push([`${branch.toString()}:${branch.toString()}`], pushOpts);
            return {
                status: { code: 201, msg: 'Successfully pushed to Git remote.' },
            };
        } catch (e1) {
            console.log("* * * * * * *")
            console.log(e1)
            console.log("* * * * * * *")
            await index.clear();
            await hardResetToCommit(repo, branchCommit, branch);
            throw new Meteor.Error('Could not push current revision.');
        }
    };

    const putCommitMsgInParentheses = (commit) => {
        let message = commit.message();
        if (!message) return '';
        [message] = message.split('\n');
        message = message.substring(0, 100) + (message.length > 100 ? '...' : '');
        return ` (${message})`;
    };

    Meteor.methods({
        async revertToCommit(projectId, sha, { commitFirst = true } = {}) {
            checkIfCan('import:x', projectId);
            check(projectId, String);
            check(sha, String);
            check(commitFirst, Boolean);
            let repoInfo = await getRemote(projectId);
            const originalBranchCommit = repoInfo.branchCommit;
            let commit;
            try {
                commit = await repoInfo.repo.getCommit(sha);
            } catch (e) {
                console.log(e)
                throw new Meteor.Error('Could not find commit.');
            }
            if (commitFirst) {
                repoInfo = await commitChanges(
                    projectId,
                    `Project state before revert to ${sha.substring(0, 8)}`,
                    repoInfo,
                );
            }
            const {
                repo, dir, exclusions, branch,
            } = repoInfo;
            try {
                await repo.setHeadDetached(sha);
                // await new Promise(resolve => setTimeout(() => resolve(), 15000));
                await hardResetToCommit(repo, commit, null);
                // await new Promise(resolve => setTimeout(() => resolve(), 30000));
            } catch (e) {
                if (process.env.MODE === 'development') {
                    console.info(e)
                }
                hardResetToCommit(repo, originalBranchCommit, branch);
                throw new Meteor.Error('Could not checkout commit.');
            }
            const backupZip = await Meteor.callWithPromise(
                'exportRasa',
                projectId,
                'all',
                { noBlob: true },
            );
            try {
                const untrackedFiles = (await repo.getStatus())
                    .filter(f => f.isNew() || f.isModified())
                    .map(f => f.path());
                const { summary = [] } = await importSteps({
                    projectId,
                    wipeProject: true,
                    ignoreFilesWithErrors: true,
                    files: await repoDirToFileList(dir, [
                        ...exclusions,
                        ...untrackedFiles,
                    ]),
                });
                if (summary.length) throw new Error('import summary not empty');
                await repo.setHead(branch.name()); // repoint head
                // await new Promise(resolve => setTimeout(() => resolve(), 15000));
                const message = putCommitMsgInParentheses(commit);
                const { status } = await commitChanges(
                    projectId,
                    `Revert to ${sha.substring(0, 8)}${message}`,
                    repoInfo,
                );
                if (status) return { status };
                return pushToRemote(repoInfo);
            } catch (e) {
                if (process.env.MODE === 'development') {
                    console.info(e)
                }
                await importSteps({
                    projectId,
                    wipeProject: true,
                    ignoreFilesWithErrors: true,
                    files: [
                        {
                            filename: 'backup.zip',
                            createReadStream: () => backupZip.generateNodeStream(),
                        },
                    ],
                });
                hardResetToCommit(repo, originalBranchCommit, branch);
                throw new Meteor.Error('Error reverting to commit.');
            }
        },
        async getHistoryOfCommits(projectId, { cursor = null, pageSize = 20 } = {}) {
            checkIfCan('import:x', projectId);
            check(projectId, String);
            check(cursor, Match.Maybe(String));
            check(pageSize, Number);

            const { repo, branchCommit, url: repoUrl } = await getRemote(projectId);
            const startCommit = cursor ? await repo.getCommit(cursor) : branchCommit;
            let [, url] = repoUrl.split('@');
            url = url.replace(':', '/').replace(/.git$/, '');
            const formatUrl = (sha) => {
                if (url.includes('bitbucket')) return `https://${url}/commits/${sha}`;
                return `https://${url}/commit/${sha}`; // github, gitlab
            };

            const formatCommit = c => ({
                sha: c.id().tostrS(),
                author: c.author().name(),
                msg: c.message(),
                url: formatUrl(c.id().tostrS()),
                time: c.time(),
                isHead: c.id().tostrS() === branchCommit.id().tostrS(),
            });
            return new Promise((resolve, reject) => {
                const historyWalker = startCommit.history();
                const commits = [];
                historyWalker.on('commit', (commit) => {
                    if (commits.length >= pageSize) {
                        resolve({
                            commits: commits.map(formatCommit),
                            hasNextPage: true,
                        });
                    }
                    if (commit.id().tostrS() !== cursor) commits.push(commit);
                });
                historyWalker.on('end', allCommits => resolve({ commits: allCommits.map(formatCommit), hasNextPage: false }));
                historyWalker.on('error', error => reject(error));
                historyWalker.start();
            });
        },
        async commitAndPushToRemote(projectId, commitMessage) {
            checkIfCan('import:x', projectId);
            check(projectId, String);
            check(commitMessage, String);
            const repoInfo = await getRemote(projectId);
            const { status } = await commitChanges(projectId, commitMessage, repoInfo);
            if (status) return { status };
            return pushToRemote(repoInfo);
        },
        async exportRasa(projectId, language, options) {
            checkIfCan('export:x', projectId);
            check(projectId, String);
            check(language, String);
            check(options, Object);
            const passedLang = language === 'all' ? {} : { language };

            const project = Projects.findOne({ _id: projectId });
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
            const formResults = await Promise.all(
                envs.map(async (environment) => {
                    const formResult = await FormResults.find(
                        { projectId, ...getEnvQuery('environment', environment) },
                        { _id: 0 },
                        { sort: { date: -1, language: 1 } },
                    );
                    return {
                        environment,
                        formResult,
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

            const analyticsConfig = await AnalyticsDashboards.findOne(
                { projectId },
                { _id: 0 },
            ).lean();
            const storyTests = await Stories.find({
                projectId,
                type: 'test_case',
            }).fetch();
            const storyGroups = await StoryGroups.find({
                projectId,
                smartGroup: { $exists: false },
            }).fetch();
            const storyGroupDict = {};
            storyGroups.forEach(({ _id, name }) => {
                storyGroupDict[_id] = name;
            });
            const testsByLanguage = storyTests.reduce((acc, testCase) => {
                const storyGroupName = storyGroupDict[testCase.storyGroupId];
                if (!acc[testCase.language]) acc[testCase.language] = [];
                const formattedData = formatTestCaseForRasa(testCase, storyGroupName);
                acc[testCase.language].push(formattedData);
                return acc;
            }, {});

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
                tests:
                    language === 'all'
                        ? testsByLanguage
                        : { [language]: testsByLanguage[language] },
            };

            const defaultDomain = project?.defaultDomain?.content || '';
            const widgetSettings = project?.chatWidgetSettings || {};

            const configData = project;
            delete configData.gitSettings;
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
                    data = await convertJsonToYaml(projectId, exportData.nlu[l], l);
                    extension = 'yml';
                } catch (e) {
                    // console.log(e)
                    data = JSON.stringify(exportData.nlu[l], null, 2);
                    extension = 'json';
                }
                rasaZip.addFile(
                    data,
                    languages.length > 1
                        ? `data/nlu/${l}.${extension}`
                        : `data/nlu.${extension}`,
                );
                if (exportData.tests[l]) {
                    rasaZip.addFile(
                        safeDump({ stories: exportData.tests[l] }),
                        `data/tests/test_${l}_stories.yml`,
                    );
                }
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
            formResults.forEach(({ formResult: formResultsPerEnv, environment }) => {
                if (formResultsPerEnv && formResultsPerEnv.length > 0) {
                    rasaZip.addFile(
                        JSON.stringify(formResultsPerEnv, null, 2),
                        `botfront/formresults${envSuffix(environment, formResults)}.json`,
                    );
                }
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
            if (Object.keys(analyticsConfig).length > 0) {
                rasaZip.addFile(
                    safeDump(analyticsConfig),
                    'botfront/analyticsconfig.yml',
                );
            }
            if (Object.keys(widgetSettings).length > 0) {
                rasaZip.addFile(safeDump(widgetSettings), 'botfront/widgetsettings.yml');
            }

            if (options.noBlob) return rasaZip.zipContainer;
            return rasaZip.generateBlob();
        },
    });
}
