
import { Meteor } from 'meteor/meteor';

import http from 'http';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';


if (Meteor.isServer) {
    Meteor.methods({
        'exportProject'(apiHost) {
            check(apiHost, String);
            checkIfCan('global-admin');

            const options = {
                hostname: 'localhost',
                port: 8080,
                path: '/project/bf/export',
                connection: 'keep-alive',
                localAddress: '127.0.0.1',
                method: 'GET',
                protovol: 'http',
            };

            const exportRequest = new Promise((resolve) => {
                const req = http.request(options, (res) => {
                    // resolve(res.statusCode);
                    console.log(res.headers['content-length']);
                    let data = '';
                    res.on('data', (d) => {
                        data += d;
                        if (res.statusCode === 200
                            && data.length === parseInt(res.headers['content-length'], 10)) {
                            console.log('____________');
                            console.log(JSON.parse(data));
                            resolve(data);
                        }
                    });
                });
                req.on('error', (error) => {
                    console.log(error);
                });
                req.end();
            });
            return exportRequest;
        },
    });
}
