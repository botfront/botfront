
import { Meteor } from 'meteor/meteor';

import superagent from 'superagent';
// import http from 'http';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
import { generateErrorText } from './importExport.utils';


if (Meteor.isServer) {
    Meteor.methods({
        'exportProject'(apiHost, projectId) {
            check(apiHost, String);
            check(projectId, String);
            checkIfCan('global-admin');
            const exportRequest = new Promise((resolve) => {
                superagent
                    .get(`${apiHost}/project/${projectId}/export`)
                    .then((res) => {
                        console.log(res.body);
                        resolve({ data: JSON.stringify(res.body) });
                    })
                    .catch((err) => {
                        resolve({ error: { header: 'Export Failed', text: generateErrorText(err) } });
                    });
            });
            return exportRequest;
        },
    });
}
