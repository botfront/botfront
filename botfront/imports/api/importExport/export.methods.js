
import { Meteor } from 'meteor/meteor';

import http from 'http';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';


if (Meteor.isServer) {
    Meteor.methods({
        'exportProject'(apiHost) {
            check(apiHost, String);
            checkIfCan('global-admin');

            const splitUrl = apiHost.split(':');

            const options = {
                hostname: splitUrl[1].slice(2),
                port: splitUrl[2],
                path: '/project/bf/export',
                connection: 'keep-alive',
                localAddress: '127.0.0.1',
                method: 'GET',
                protovol: splitUrl[0],
            };

            const exportRequest = new Promise((resolve) => {
                const req = http.request(options, (res) => {
                    if (res.statusCode !== 200) {
                        resolve({ success: false, errorText: `${res.statusCode} API was not found` });
                    }
                    let data = '';
                    res.on('data', (d) => {
                        data += d;
                        if (
                            res.statusCode === 200
                            && data.length === parseInt(res.headers['content-length'], 10)
                        ) {
                            resolve({ data, success: true });
                        }
                    });
                });
                req.on('error', (error) => {
                    let errorText;
                    if (error.code === 'ENOTFOUND') {
                        errorText = 'The botfront API was not found. Please verify your API url is correct';
                    } else {
                        errorText = `the API request returned an error. Error code: ${error.code}`;
                    }
                    resolve({ success: false, errorText });
                });
                req.end();
            });
            return exportRequest;
        },
    });
}
