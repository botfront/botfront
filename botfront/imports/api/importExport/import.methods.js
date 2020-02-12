import { Meteor } from 'meteor/meteor';
import axios from 'axios';

import { check } from 'meteor/check';

import { generateErrorText, generateImportResponse } from './importExport.utils';

if (Meteor.isServer) {
    import { appLogger, addLoggingInterceptors } from '../../../server/logger';

    const trainingAppLogger = appLogger.child({ file: 'import.methods.js' });
    Meteor.methods({
        async importProject(projectFile, apiHost, projectId) {
            check(projectFile, Object);
            check(apiHost, String);
            check(projectId, String);
            const appMethodLogger = trainingAppLogger.child({ userId: Meteor.userId(), method: 'importProject', args: { projectFile, apiHost, projectId } });
            const importAxios = axios.create();
            addLoggingInterceptors(importAxios, appMethodLogger);
            const importRequest = importAxios.put(
                `${apiHost}/project/${projectId}/import`,
                projectFile,
                { maxContentLength: 100000000 },
            )
                .then(res => (generateImportResponse(res.status)))
                .catch(err => (
                    { error: { header: 'Import Failed', text: generateErrorText(err) } }
                ));
            return importRequest;
        },
    });
}
