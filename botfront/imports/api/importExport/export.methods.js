
import { Meteor } from 'meteor/meteor';

import http from 'http';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
import { getRequestOptions, generateErrorText } from '../../ui/components/templates/import-export/ImportExport.utils';


if (Meteor.isServer) {
    Meteor.methods({
        'exportProject'(apiHost) {
            check(apiHost, String);
            checkIfCan('global-admin');

            const options = getRequestOptions(apiHost, '/project/bf/export');

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
                    resolve({ success: false, errorText: generateErrorText(error) });
                });
                req.end();
            });
            return exportRequest;
        },
    });
}
