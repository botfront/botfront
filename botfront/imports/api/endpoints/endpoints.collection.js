import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { can } from '../../lib/scopes';
import { EndpointsSchema } from './endpoints.schema';

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
        if (can('project-settings:r', projectId, this.userId)) return Endpoints.find({ projectId });
        return this.ready();
    });
}

Endpoints.attachSchema(EndpointsSchema);
