import { Meteor } from 'meteor/meteor';
import axios from 'axios';

import { check } from 'meteor/check';

import { GlobalSettings } from '../globalSettings/globalSettings.collection';

import { generateErrorText, generateImportResponse } from './importExport.utils';
import { checkIfCan, can } from '../../lib/scopes';

if (Meteor.isServer) {
    import {
        getAppLoggerForFile,
        getAppLoggerForMethod,
        addLoggingInterceptors,
        auditLog,
    } from '../../../server/logger';

    const importAppLogger = getAppLoggerForFile(__filename);
    Meteor.methods({
        async importProject(uploadedFile, projectId) {
            checkIfCan('import:x', projectId);
            check(projectId, String);
            check(uploadedFile, Object);
            const projectFile = uploadedFile;

            if (!can('incoming:w')) {
                delete projectFile.conversations;
            }
            if (!can('resources:w')) {
                delete projectFile.credentials;
                delete projectFile.endpoints;
                delete projectFile.instances;
            }


            const apiHost = GlobalSettings
                .findOne({ _id: 'SETTINGS' }, { fields: { 'settings.private.bfApiHost': 1 } })
                .settings.private.bfApiHost;

            const appMethodLogger = getAppLoggerForMethod(
                importAppLogger,
                'importProject',
                Meteor.userId(),
                { projectFile: 'File', apiHost, projectId },
            );
            const importAxios = axios.create();
            addLoggingInterceptors(importAxios, appMethodLogger);
            const importRequest = await importAxios.put(
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
                type: 'created',
                projectId,
                operation: 'project-created',
                resId: projectId,
                resType: 'project',
            });
            if (importRequest.error) {
                throw new Meteor.Error(500, importRequest.error.text);
            }
            return importRequest;
        },
    });
}
