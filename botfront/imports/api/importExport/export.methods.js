
import { Meteor } from 'meteor/meteor';

import http from 'http';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
import { getRequestOptions, generateErrorText } from './importExport.utils';


if (Meteor.isServer) {
    Meteor.methods({
        'exportProject'(apiHost, projectId) {
            check(apiHost, String);
            check(projectId, String);
            checkIfCan('global-admin');

            let timeOut = false;
            let resolveByTimeOut;

            const options = getRequestOptions(apiHost, `/project/${projectId}/export`, 'GET');

            const exportRequest = new Promise((resolve) => {
                const req = http.request(options, (res) => {
                    if (res.statusCode !== 200) {
                        if (resolveByTimeOut !== undefined) clearInterval(resolveByTimeOut);
                        resolve({ success: false, errorText: `${res.statusCode} API was not found` });
                    }
                    let data = '';
                    res.on('data', (d) => {
                        data += d;
                        timeOut = false;
                        if (resolveByTimeOut !== undefined) clearInterval(resolveByTimeOut);
                        resolveByTimeOut = setInterval(() => {
                            if (timeOut === true) {
                                if (resolveByTimeOut !== undefined) clearInterval(resolveByTimeOut);
                                resolve({ data, success: true });
                            }
                            timeOut = true;
                        }, 2000);
                        if (
                            res.statusCode === 200
                            && data.length === parseInt(res.headers['content-length'], 10)
                        ) {
                            if (resolveByTimeOut !== undefined) clearInterval(resolveByTimeOut);
                            resolve({ data, success: true });
                        }
                    });
                });
                req.on('error', (error) => {
                    if (resolveByTimeOut !== undefined) clearInterval(resolveByTimeOut);
                    resolve({ success: false, errorText: generateErrorText(error) });
                });
                req.end();
            });
            return exportRequest;
        },
    });
}
