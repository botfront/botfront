import { Meteor } from 'meteor/meteor';
import axios from 'axios';

import { check } from 'meteor/check';

import { Endpoints } from '../endpoints/endpoints.collection';
import { Credentials } from '../credentials';

import { generateErrorText } from './importExport.utils';
import { ZipFolder } from './ZipFolder';

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

            const exportData = {
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


            const rasaZip = new ZipFolder();
            if (exportData.stories.length > 1) {
                exportData.stories.forEach(s => rasaZip.addFile(
                    s,
                    `data/stories/${s
                        .split('\n')[0]
                        .replace(/^# /, '')
                        .replace(/ /g, '_')
                        .toLowerCase()}.md`,
                ));
            } else {
                rasaZip.addFile(exportData.stories, 'data/stories.md');
            }
            if (passedLang === 'all') {
                Object.keys(exportData.config).forEach(k => rasaZip.addFile(exportData.config[k], `config-${k}.yml`));
                Object.keys(exportData.nlu).forEach(k => rasaZip.addFile(exportData.nlu[k].data, `data/nlu/${k}.md`));
            } else {
                rasaZip.addFile(exportData.config[language], 'config.yml');
                rasaZip.addFile(exportData.nlu[language].data, 'data/nlu.md');
            }
            rasaZip.addFile(exportData.endpoints, 'endpoints.yml');
            rasaZip.addFile(exportData.credentials, 'credentials.yml');
            rasaZip.addFile(exportData.domain, 'domain.yml');

            return rasaZip.generateBlob();
        },
    });
}
