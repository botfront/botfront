import { Meteor } from 'meteor/meteor';
import axios from 'axios';

import { check } from 'meteor/check';

import { Endpoints } from '../endpoints/endpoints.collection';
import { Credentials } from '../credentials';
import { Instances } from '../instances/instances.collection';
import { getCredentialsAndEndpoints } from '../graphql/config/configResolver';

import { generateErrorText } from './importExport.utils';

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
            const instance = await Instances.findOne({ projectId });
            const { credentials, endpoints } = await getCredentialsAndEndpoints({
                projectId, output: 'yaml',
            });
            const rasaData = await Meteor.callWithPromise(
                'rasa.getTrainingPayload',
                projectId,
                instance,
                { ...passedLang, joinStoryFiles: false },
            );

            const exportData = {
                config:
                    language === 'all'
                        ? rasaData.config
                        : { [language]: rasaData.config[language] },
                credentials,
                domain: rasaData.domain,
                endpoints,
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
