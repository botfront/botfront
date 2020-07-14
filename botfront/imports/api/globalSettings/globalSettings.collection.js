import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { can } from '../../lib/scopes';
import { GlobalSettingsSchema } from './globalSettings.schema';


export const f2 = () => ('MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoQMG+mrQvq0ThlAde7hS');

export const f5 = () => ('wNs5+2aq9U3xjmiVjfHy5i58Lh1M/C9RMJUBCQAKCsC/urlvBpG/1oa0yUMrtdSZ');

export const f8 = () => ('QQIDAQAB');

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
    Meteor.publish('settings', function () {
        if (can('global-settings:r', { anyScope: true })) return GlobalSettings.find({ _id: 'SETTINGS' });
        return GlobalSettings.find({ _id: 'SETTINGS' }, { fields: { 'settings.public': 1 } });
    });
}
