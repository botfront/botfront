
import { Meteor } from 'meteor/meteor';

import http from 'http';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';


if (Meteor.isServer) {
    Meteor.methods({
        'importProject'(projectFile, apiHost) {
            check(projectFile, Object);
            check(apiHost, String);
            checkIfCan('global-admin');
            const data = JSON.stringify(projectFile);

            const splitUrl = apiHost.split(':');
            
            const options = {
                hostname: splitUrl[1].slice(2),
                port: splitUrl[2],
                path: '/project/bf/import',
                connection: 'keep-alive',
                localAddress: '127.0.0.1',
                method: 'PUT',
                protovol: splitUrl[0],
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length,
                },
            };

            const importRequest = new Promise((resolve) => {
                const req = http.request(options, (res) => {
                    if (res.statusCode === 200) {
                        resolve({ success: true, statusCode: res.statusCode });
                    } else if (res.statusCode === 422) {
                        resolve({
                            success: false,
                            errorMessage: {
                                header: 'Import Failed', text: 'The uploaded file is not a valid Botfront JSON file'
                            },
                        });
                    } else {
                        resolve({
                            success: false,
                            errorMessage: {
                                header: 'Import Failed', text: `the import project request to the Botfront API failed. status: ${res.statusCode}`,
                            },
                        });
                    }
                });
                req.on('error', (error) => {
                    let errorText = 'Encountered an unexpected error when trying to access the botfront API';
                    if (error.code === 'ENOTFOUND') {
                        errorText = 'The botfront API was not found. Please verify your API url is correct';
                    } else {
                        errorText = `the API request returned an error. Error code: ${error.code}`;
                    }
                    resolve({
                        success: false,
                        errorMessage: {
                            header: 'Import Failed', text: errorText,
                        },
                    });
                });
                req.write(data);
                req.end();
            });
            return importRequest;
        },
    });
}

// { header: 'Import Failed', text: 'Uploaded file is not a valid Botfront JSON file' }