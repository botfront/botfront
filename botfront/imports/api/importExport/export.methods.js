import { Meteor } from 'meteor/meteor';
import axios from 'axios';
import _ from 'lodash';

import { check } from 'meteor/check';

import { safeDump } from 'js-yaml';
import { Endpoints } from '../endpoints/endpoints.collection';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';
import { Credentials } from '../credentials';

import { generateErrorText } from './importExport.utils';
import { ZipFolder } from './ZipFolder';
import { Projects } from '../project/project.collection';
// import { NLUModels } from '../nlu_model/nlu_model.collection';
import { Instances } from '../instances/instances.collection';
import Conversations from '../graphql/conversations/conversations.model';
import Activity from '../graphql/activity/activity.model';

// import { StoryGroups } from '../storyGroups/storyGroups.collection';


if (Meteor.isServer) {
    import {
        getAppLoggerForFile,
        getAppLoggerForMethod,
        addLoggingInterceptors,
    } from '../../../server/logger';

    const exportAppLogger = getAppLoggerForFile(__filename);

    Meteor.methods({
        exportProject(projectId, options) {
            check(projectId, String);
            check(options, Object);

            const apiHost = GlobalSettings
                .findOne({ _id: 'SETTINGS' }, { fields: { 'settings.private.bfApiHost': 1 } })
                .settings.private.bfApiHost;

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
            check(projectId, String);
            check(language, String);
            check(options, Object);
            const passedLang = language === 'all' ? {} : { language };

            const project = Projects.findOne({ _id: projectId });
            const hasEnvs = project.deploymentEnvironments && project.deploymentEnvironments.length !== 0;
            let credentials;
            let endpoints;

            if (hasEnvs) {
                credentials = await Promise.all(project.deploymentEnvironments.map(async (environment) => {
                    const creds = await Credentials.findOne(
                        { projectId, environment },
                        { fields: { credentials: 1 } },
                    );
                    return {
                        environment,
                        credentials: creds.credentials,
                    };
                }));

                endpoints = await Promise.all(project.deploymentEnvironments.map(async (environment) => {
                    const endpoint = await Endpoints.findOne(
                        { projectId, environment },
                        { fields: { endpoints: 1 } },
                    );
                    return {
                        environment,
                        endpoints: endpoint.endpoints,
                    };
                }));
            } else {
                credentials = await Credentials.findOne(
                    { projectId },
                    { fields: { credentials: 1 } },
                ).credentials;
                endpoints = await Endpoints.findOne(
                    { projectId },
                    { fields: { endpoints: 1 } },
                ).endpoints;
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
                    const fragmentsByType = safeDump({ stories, rules });
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

            const instance = safeDump(await Instances.findOne({ projectId }));
            const defaultDomain = project?.defaultDomain?.content || '';


            const rasaZip = new ZipFolder();
            if (exportData.fragments.length > 1) {
                exportData.fragments.forEach(f => rasaZip.addFile(
                    f.fragments,
                    `data/stories/${f.group
                        .replace(/ /g, '_')
                        .toLowerCase()}.yml`,
                        
                ));
            } else {
                rasaZip.addFile(exportData.fragments[0].fragments, 'data/stories.yml');
            }
            if (language === 'all') {
                Object.keys(exportData.config).forEach(k => rasaZip.addFile(exportData.config[k], `config.${k}.yml`));
                Object.keys(exportData.nlu).forEach(k => rasaZip.addFile(JSON.stringify(exportData.nlu[k]), `data/nlu/${k}.json`));
            } else {
                rasaZip.addFile(exportData.config[language], 'config.yml');
                rasaZip.addFile(JSON.stringify(exportData.nlu[language]), 'data/nlu.json');
            }

            if (hasEnvs) {
                endpoints.forEach((endpoint) => { rasaZip.addFile(endpoint.endpoints, `endpoints.${endpoint.environment}.yml`); });
                credentials.forEach((credential) => { rasaZip.addFile(credential.credentials, `credentials.${credential.environment}.yml`); });
            } else {
                rasaZip.addFile(endpoints, 'endpoints.yml');
                rasaZip.addFile(credentials, 'credentials.yml');
            }
            
            rasaZip.addFile(exportData.domain, 'domain.yml');
            rasaZip.addFile(instance, 'botfront/instance.yml');
            rasaZip.addFile(defaultDomain, 'botfront/default-domain.yml');
            
            if (options.conversations) {
                const conversations = await Conversations.find({ projectId }).lean();
                rasaZip.addFile(JSON.stringify(conversations, null, 2), 'botfront/conversation.json');
            }
            if (options.incoming) {
                const incoming = await Activity.find({ projectId }).lean();
                rasaZip.addFile(JSON.stringify(incoming, null, 2), 'botfront/incoming.json');
            }


            return rasaZip.generateBlob();
        },
    });
}
