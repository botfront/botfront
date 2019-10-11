
import { Meteor } from 'meteor/meteor';

import superagent from 'superagent';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
import { generateErrorText, generateImportResponse } from './importExport.utils';


if (Meteor.isServer) {
    Meteor.methods({
        'importProject'(projectFile, apiHost, projectId) {
            check(projectFile, Object);
            check(apiHost, String);
            check(projectId, String);
            checkIfCan('global-admin');

            const importRequest = new Promise((resolve) => {
                superagent
                    .put(`${apiHost}/project/${projectId}/import`)
                    .send(projectFile)
                    .then((res) => {
                        console.log(res.status);
                        resolve(generateImportResponse(res.status));
                        resolve({ success: true });
                    })
                    .catch((err) => {
                        resolve({ error: { header: 'Export Failed', text: generateErrorText(err) } });
                    });
            });
            return importRequest;
        },
    });
}
