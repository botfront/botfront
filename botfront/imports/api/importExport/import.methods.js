
import { Meteor } from 'meteor/meteor';
import axios from 'axios';

import { check } from 'meteor/check';

import { generateErrorText, generateImportResponse } from './importExport.utils';


if (Meteor.isServer) {
    Meteor.methods({
        async 'importProject'(projectFile, apiHost, projectId) {
            check(projectFile, Object);
            check(apiHost, String);
            check(projectId, String);

            try {
                const res = await axios.put(`${apiHost}/project/${projectId}/import`, projectFile);
                return generateImportResponse(res.status);
            } catch (err) {
                throw new Meteor.Error(generateErrorText(err));
            }
        },
    });
}
