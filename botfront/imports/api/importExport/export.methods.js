import { Meteor } from 'meteor/meteor';
import axios from 'axios';

import { check } from 'meteor/check';

import yaml from 'js-yaml';
import { Endpoints } from '../endpoints/endpoints.collection';
import { Credentials } from '../credentials';

import { generateErrorText } from './importExport.utils';
import { ZipFolder } from './ZipFolder';
import { Projects } from '../project/project.collection';
// import { NLUModels } from '../nlu_model/nlu_model.collection';
import { Instances } from '../instances/instances.collection';
import { Conversations } from '../conversations';
// import { StoryGroups } from '../storyGroups/storyGroups.collection';
import { Slots } from '../slots/slots.collection';


if (Meteor.isServer) {
    import {
        getAppLoggerForFile,
        getAppLoggerForMethod,
        addLoggingInterceptors,
    } from '../../../server/logger';

    const exportAppLogger = getAppLoggerForFile(__filename);

    Meteor.methods({
        exportProject(apiHost, projectId, options) {
            check(apiHost, String);
            check(projectId, String);
            check(options, Object);

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
        async exportRasa(projectId, language) {
            check(projectId, String);
            check(language, String);

            const passedLang = language === 'all' ? {} : { language };
            const credentials = await Credentials.findOne(
                { projectId },
                { fields: { credentials: 1 } },
            );
            const endpoints = await Endpoints.findOne(
                { projectId },
                { fields: { endpoints: 1 } },
            );
            const rasaData = await Meteor.callWithPromise(
                'rasa.getTrainingPayload',
                projectId,
                { ...passedLang, joinStoryFiles: false },
            );

            const rasaExportData = {
                config:
                    language === 'all'
                        ? rasaData.config
                        : { [language]: rasaData.config[language] },
                credentials: credentials.credentials,
                domain: rasaData.domain,
                endpoints: endpoints.endpoints,
                nlu:
                    language === 'all'
                        ? rasaData.nlu
                        : { [language]: rasaData.nlu[language] },
                stories: rasaData.stories,
            };


            const project = Projects.findOne({ _id: projectId });
            const instances = Instances.findOne({ projectId });
            const conversations = Conversations.findOne({ projectId });
            const slots = Slots.findOne({ projectId });
            
            
            const BotfrontData = {
                project, instances, conversations, slots,
            };
            const bontfrontYaml = yaml.safeDump(BotfrontData);


            const rasaZip = new ZipFolder();
            if (rasaExportData.stories.length > 1) {
                rasaExportData.stories.forEach(s => rasaZip.addFile(
                    s,
                    `data/stories/${s
                        .split('\n')[0]
                        .replace(/^# /, '')
                        .replace(/ /g, '_')
                        .toLowerCase()}.md`,
                ));
            } else {
                rasaZip.addFile(rasaExportData.stories, 'data/stories.md');
            }
            if (language === 'all') {
                // rasaZip.addFile(exportData.config, 'config.yml');
                // rasaZip.addFile(exportData.nlu[language].data, 'data/nlu.md');
                Object.keys(rasaExportData.config).forEach(k => rasaZip.addFile(rasaExportData.config[k], `config-${k}.yml`));
                Object.keys(rasaExportData.nlu).forEach(k => rasaZip.addFile(rasaExportData.nlu[k].data, `data/nlu/${k}.md`));
            } else {
                rasaZip.addFile(rasaExportData.config[language], 'config.yml');
                rasaZip.addFile(rasaExportData.nlu[language].data, 'data/nlu.md');
            }
            rasaZip.addFile(rasaExportData.endpoints, 'endpoints.yml');
            rasaZip.addFile(rasaExportData.credentials, 'credentials.yml');
            rasaZip.addFile(rasaExportData.domain, 'domain.yml');
            rasaZip.addFile(bontfrontYaml, 'botfront.yml');


            return rasaZip.generateBlob();
        },
    });
}
