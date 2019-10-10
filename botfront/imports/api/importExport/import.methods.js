
import { Meteor } from 'meteor/meteor';

import http from 'http';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
import { getRequestOptions, generateErrorText, generateImportResponse } from '../../ui/components/templates/import-export/ImportExport.utils';


if (Meteor.isServer) {
    Meteor.methods({
        'importProject'(projectFile, apiHost) {
            check(projectFile, Object);
            check(apiHost, String);
            checkIfCan('global-admin');
            const data = JSON.stringify(projectFile);

            const headers = {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
            };
            const options = getRequestOptions(apiHost, '/project/bf/import', 'PUT', headers);

            const importRequest = new Promise((resolve) => {
                const req = http.request(options, (res) => {
                    resolve(generateImportResponse(res.statusCode));
                    // if (res.statusCode === 200) {
                    //     resolve({ success: true, statusCode: res.statusCode });
                    // } else if (res.statusCode === 422) {
                    //     resolve({
                    //         success: false,
                    //         errorMessage: {
                    //             header: 'Import Failed', text: 'The uploaded file is not a valid Botfront JSON file',
                    //         },
                    //     });
                    // } else {
                    //     resolve({
                    //         success: false,
                    //         errorMessage: {
                    //             header: 'Import Failed', text: `the request to the Botfront API failed. status: ${res.statusCode}`,
                    //         },
                    //     });
                    // }
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
