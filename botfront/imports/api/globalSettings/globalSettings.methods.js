
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

        async 'get.rasaRestart.webhooks'(projectId) {
            checkIfCan('projects:w', projectId);
            check(projectId, String);
            const {
                settings: {
                    private: { webhooks },
                },
            } = GlobalSettings.findOne({}, { fields: { 'settings.private.webhooks': 1 } });
            return webhooks.restartRasaWebhook;
        },
    });
}
