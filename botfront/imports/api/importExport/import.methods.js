
import { Meteor } from 'meteor/meteor';

import http from 'http';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
import { getRequestOptions, generateErrorText, generateImportResponse } from './importExport.utils';


if (Meteor.isServer) {
    Meteor.methods({
        'importProject'(projectFile, apiHost, projectId) {
            check(projectFile, Object);
            check(apiHost, String);
            check(projectId, String);
            checkIfCan('global-admin');
            const data = JSON.stringify(projectFile);

            const headers = {
                'Content-Type': 'application/json',
            };
            const options = getRequestOptions(apiHost, `/project/${projectId}/import`, 'PUT', headers);

            const importRequest = new Promise((resolve) => {
                const req = http.request(options, (res) => {
                    if (res.statusCode) {
                        resolve(generateImportResponse(res.statusCode));
                    }
                });
                req.on('error', (error) => {
                    resolve({
                        success: false, errorMessage: { header: 'Import Failed', text: generateErrorText(error) },
                    });
                });
                req.write(data);
                req.end();
            });
            return importRequest;
        },
    });
}
