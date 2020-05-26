
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { formatError } from '../../lib/utils';
import { GlobalSettings } from './globalSettings.collection';
import { checkIfCan } from '../../lib/scopes';

if (Meteor.isServer) {
    Meteor.methods({
        'settings.save'(settings) {
            checkIfCan('global-settings:w');
            check(settings, Object);
            try {
                return GlobalSettings.update({ _id: 'SETTINGS' }, { $set: settings });
            } catch (e) {
                throw formatError(e);
            }
        },


        'getRestartRasaWebhook' (projectId) {
            checkIfCan('projects:w', projectId);
            check(projectId, String);
            return GlobalSettings.findOne({ _id: 'SETTINGS' }, { fields: { 'settings.private.webhooks.restartRasaWebhook': 1 } });
        },
        'getDeploymentWebhook'(projectId) {
            checkIfCan('projects:w', projectId);
            check(projectId, String);
            return GlobalSettings.findOne({ _id: 'SETTINGS' }, { fields: { 'settings.private.webhooks.deploymentWebhook': 1 } });
        },
    });
}
