import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';

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
        if (!checkIfCan('stories:r', projectId, null, { backupPlan: true })) {
            return this.ready();
        }
        Slots.find({ projectId });
        return Slots.find({ projectId });
    });
}
