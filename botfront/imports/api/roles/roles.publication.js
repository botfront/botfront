import { Meteor } from 'meteor/meteor';
import { checkIfCan } from '../../lib/scopes';

if (Meteor.isServer) {
    Meteor.publish('roles', function () {
        checkIfCan('nlu-model:w');
        return Meteor.roles.find({});
    });
}
