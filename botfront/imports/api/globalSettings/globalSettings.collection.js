import '../../lib/dynamic_import';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { can, checkIfCan } from '../../lib/scopes';


export const GlobalSettings = new Mongo.Collection('admin_settings');
// Deny all client-side updates on the Credentials collection
GlobalSettings.deny({
    insert() {
        return true;
    },
    update() {
        return true;
    },
    remove() {
        return true;
    },
});

const orchestration = process.env.ORCHESTRATOR ? process.env.ORCHESTRATOR : 'docker-compose';
import(`./globalSettings.schema.${orchestration}`)
    .then(({ GlobalSettingsSchema }) => {
        GlobalSettings.attachSchema(GlobalSettingsSchema);
        if (Meteor.isServer) {
            Meteor.publish('settings', function () {
                if (can('global-settings:r', { anyScope: true })) return GlobalSettings.find({ _id: 'SETTINGS' });
                return GlobalSettings.find({ _id: 'SETTINGS' }, { fields: { 'settings.public': 1 } });
            });

            Meteor.publish('deploymentWebhook', function (projectId) {
                checkIfCan('projects:w', projectId);
                check(projectId, String);
                return GlobalSettings.find({ _id: 'SETTINGS' }, { fields: { 'settings.private.webhooks.deploymentWebhook': 1 } });
            });
        }
    });
