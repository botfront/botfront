
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

            const options = {
                hostname: 'localhost',
                port: 8080,
                path: '/project/bf/import',
                connection: 'keep-alive',
                localAddress: '127.0.0.1',
                method: 'PUT',
                protovol: 'http',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length,
                },
            };

            const importRequest = new Promise((resolve) => {
    
                const req = http.request(options, (res) => {
                    resolve(res.statusCode);
                });
    
                req.on('error', (/* error */) => {
                });
                req.write(data);
                req.end();
            });
            return importRequest;
        },
    });
}
