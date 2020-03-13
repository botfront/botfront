import { Meteor } from 'meteor/meteor';
import axios from 'axios';

import { check } from 'meteor/check';

import { generateErrorText, generateImportResponse } from './importExport.utils';
import { checkIfCan } from '../../lib/scopes';

if (Meteor.isServer) {
    import {
        getAppLoggerForFile,
        getAppLoggerForMethod,
        addLoggingInterceptors,
        auditLog,
    } from '../../../server/logger';

    const importAppLogger = getAppLoggerForFile(__filename);
    Meteor.methods({
        async importProject(projectFile, apiHost, projectId) {
            checkIfCan('projects:w', projectId);
            check(projectId, String);
            check(projectFile, Object);
            check(apiHost, String);
            const appMethodLogger = getAppLoggerForMethod(
                importAppLogger,
                'importProject',
                Meteor.userId(),
                { projectFile: 'File', apiHost, projectId },
            );
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
            auditLog('Imported project', {
                user: Meteor.user(),
                type: 'create',
                projectId,
                operation: 'project-created',
                resId: projectId,
                resType: 'project',
            });
            return importRequest;
        },
    });
}
