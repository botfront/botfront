import { Meteor } from 'meteor/meteor';
import axios from 'axios';

import { check } from 'meteor/check';

import { generateErrorText, generateImportResponse } from './importExport.utils';

if (Meteor.isServer) {
    Meteor.methods({
        async importProject(projectFile, apiHost, projectId) {
            check(projectFile, Object);
            check(apiHost, String);
            check(projectId, String);
            const importRequest = axios.put(
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
