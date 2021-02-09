import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { can } from '../../lib/scopes';
import { GlobalSettingsSchema } from './globalSettings.schema';

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

GlobalSettings.attachSchema(GlobalSettingsSchema);
if (Meteor.isServer) {
    Meteor.publish('settings', function() {
        if (can('global-admin', this.userId)) return GlobalSettings.find({ _id: 'SETTINGS' });
        return GlobalSettings.find({ _id: 'SETTINGS' }, { fields: { 'settings.public': 1 } });
    });
}
