import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Slots = new Mongo.Collection('slots');

// Deny all client-side updates on the Projects collection
Slots.deny({
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

Meteor.startup(() => {
    if (Meteor.isServer) {
        Slots._ensureIndex({ projectId: 1, name: 1 }, { unique: true });
    }
});

if (Meteor.isServer) {
    Meteor.publish('slots', function(projectId) {
        check(projectId, String);
        Slots.find({ projectId });
        return Slots.find({ projectId });
    });
}
