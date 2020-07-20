import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { checkIfCan } from '../lib/scopes';

export const Conversations = new Mongo.Collection('conversations');
// Deny all client-side updates on the Conversations collection
Conversations.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

if (Meteor.isServer) {
    // This code only runs on the server
    // Only publish tasks that are public or belong to the current user
    Meteor.publish('conversations', function(projectId, skip, limit) {
        check(projectId, String);
        check(skip, Number);
        check(limit, Number);
        const options = {
            sort: { updatedAt: -1 },
            skip,
            limit,
            fields: {
                _id: 1, updatedAt: 1, status: 1, projectId: 1,
            },
        };

        try {
            checkIfCan('conversations:r', projectId);
            return Conversations.find({ projectId }, options);
        } catch (e) {
            return this.ready();
        }
    });

    Meteor.publish('conversation-detail', function(_id, projectId) {
        check(_id, String);
        check(projectId, String);
        
        try {
            checkIfCan('conversations:r', projectId);
            return Conversations.find({ _id, projectId });
        } catch (e) {
            return this.ready();
        }
    });
}

Meteor.startup(() => {
    if (Meteor.isServer) {
        Conversations._ensureIndex({ projectId: 1, status: 1, updatedAt: -1 });
        Conversations._ensureIndex({ projectId: 1, env: 1, length: 1 });
        Conversations._ensureIndex({ projectId: 1, env: 1, bucket: 1 });
        Conversations._ensureIndex({ env: 1, 'tracker.latest_event_time': -1 });
    }
});

if (Meteor.isServer) {
    Meteor.methods({
        'conversations.markAsRead'(senderId) {
            check(senderId, String);
            return Conversations.update({ _id: senderId }, { $set: { status: 'read' } });
        },

        'conversations.updateStatus'(senderId, status) {
            check(senderId, String);
            check(status, String);
            return Conversations.update({ _id: senderId }, { $set: { status } });
        },

        'conversations.delete'(senderId) {
            check(senderId, String);
            return Conversations.remove({ _id: senderId });
        },
    });
}
