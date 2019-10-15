
import { Meteor } from 'meteor/meteor';
import axios from 'axios';

import { check } from 'meteor/check';

import { generateErrorText } from './importExport.utils';


if (Meteor.isServer) {
    Meteor.methods({
        'exportProject'(apiHost, projectId) {
            check(apiHost, String);
            check(projectId, String);

            const exportRequest = axios.get(`${apiHost}/project/${projectId}/export`)
                .then(res => ({ data: JSON.stringify(res.data) }))
                .catch(err => (
                    { error: { header: 'Export Failed', text: generateErrorText(err) } }
                ));

            return exportRequest;
        },
    });
}
