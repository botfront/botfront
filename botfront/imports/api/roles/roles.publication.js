import { Meteor } from 'meteor/meteor';

Meteor.publish('roles', function () {
    return Meteor.roles.find({});
});
