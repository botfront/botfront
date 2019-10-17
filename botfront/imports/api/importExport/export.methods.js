
import { Meteor } from 'meteor/meteor';
import axios from 'axios';

import { check } from 'meteor/check';

import { generateErrorText } from './importExport.utils';


if (Meteor.isServer) {
    Meteor.methods({
        'exportProject'(apiHost, projectId, options) {
            check(apiHost, String);
            check(projectId, String);
            check(options, Object);

            const includeConversations = options.includeConversations !== undefined
                ? options.includeConversations
                : true;
            check(includeConversations, Boolean);

            const exportRequest = axios.get(
                `${apiHost}/project/${projectId}/export`,
                { params: { includeConversations: options.includeConversations } },
            )
                .then(res => ({ data: JSON.stringify(res.data) }))
                .catch(err => (
                    { error: { header: 'Export Failed', text: generateErrorText(err) } }
                ));

            return exportRequest;
        },
    });
}
