import { Meteor } from 'meteor/meteor';
import axios from 'axios';

import { check } from 'meteor/check';

import { Endpoints } from '../endpoints/endpoints.collection';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';
import { Credentials } from '../credentials';

import { generateErrorText } from './importExport.utils';
import { checkIfCan, can } from '../../lib/scopes';

if (Meteor.isServer) {
    import {
        getAppLoggerForFile,
        getAppLoggerForMethod,
        addLoggingInterceptors,
    } from '../../../server/logger';

    const exportAppLogger = getAppLoggerForFile(__filename);

    Meteor.methods({
        exportProject(projectId, options) {
            checkIfCan('export:x', projectId);
            check(projectId, String);
            check(options, Object);
            const params = { ...options };
            
            if (!can(['incoming:r'], projectId)) {
                params.conversations = 0;
            }
            if (!can(['resources:r'], projectId)) {
                params.credentials = 0;
                params.endpoints = 0;
                params.instances = 0;
            }


            const apiHost = GlobalSettings
                .findOne({ _id: 'SETTINGS' }, { fields: { 'settings.private.bfApiHost': 1 } })
                .settings.private.bfApiHost;

            const appMethodLogger = getAppLoggerForMethod(
                exportAppLogger,
                'exportProject',
                Meteor.userId(),
                { apiHost, projectId, options },
            );
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
            checkIfCan('export:x', projectId);
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
            return exportData;
        },
    });
}
