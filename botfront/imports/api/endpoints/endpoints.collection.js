import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { EndpointsSchema } from './endpoints.schema';
import { checkIfCan } from '../roles/roles';

export const Endpoints = new Mongo.Collection('endpoints');
// Deny all client-side updates on the Endpoints collection
Endpoints.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

Meteor.startup(() => {
    if (Meteor.isServer) {
        Endpoints._ensureIndex({ projectId: 1, updatedAt: -1 });
    }
});

if (Meteor.isServer) {
    Meteor.publish('endpoints', function (projectId) {
        check(projectId, String);
        try {
            checkIfCan('projects:r', projectId);
            return Endpoints.find({ projectId });
        } catch (err) {
            return this.ready();
        }
    });
}

Endpoints.attachSchema(EndpointsSchema);
