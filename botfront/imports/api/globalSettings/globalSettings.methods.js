
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { formatError } from '../../lib/utils';
import { GlobalSettings } from './globalSettings.collection';
import { checkIfCan } from '../../lib/scopes';

if (Meteor.isServer) {
    Meteor.methods({
        'settings.save'(settings) {
            check(settings, Object);
            checkIfCan('global-admin');
            try {
                return GlobalSettings.update({ _id: 'SETTINGS' }, { $set: settings });
            } catch (e) {
                throw formatError(e);
            }
        },
    });
}
