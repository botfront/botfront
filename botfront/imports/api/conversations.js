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
    Meteor.publish('conversations', function(projectId, skip, limit, env) {
        check(projectId, String);
        check(skip, Number);
        check(limit, Number);
        check(env, String);
        const options = {
            sort: { updatedAt: -1 },
            skip,
            limit,
            fields: {
                _id: 1,
                updatedAt: 1,
                status: 1,
                projectId: 1,
                env,
            },
        };

        let envSelector = { env };
        if (env === 'development') {
            envSelector = { env: { $in: ['development', null] } };
        }
        try {
            checkIfCan('incoming:r', projectId);
            return Conversations.find({ projectId, ...envSelector }, options);
        } catch (e) {
            return this.ready();
        }
    });

    Meteor.publish('conversation-detail', function(_id, projectId) {
        check(_id, String);
        check(projectId, String);
        
        try {
            checkIfCan('incoming:r', projectId);
            return Conversations.find({ _id, projectId });
        } catch (e) {
            return this.ready();
        }
    });
}

Meteor.startup(() => {
    if (Meteor.isServer) {
        Conversations._ensureIndex({ projectId: 1, status: 1, updatedAt: -1 });
    }
});

if (Meteor.isServer) {
    const findConversationProject = (senderId) => {
        const conversation = Conversations.findOne({ _id: senderId });
        if (!conversation) throw Meteor.Error('404', 'Not Found');
        return conversation.projectId;
    };
    Meteor.methods({
        'conversations.markAsRead'(senderId) {
            check(senderId, String);
            checkIfCan('incoming:r', findConversationProject(senderId));
            return Conversations.update({ _id: senderId }, { $set: { status: 'read' } });
        },

        'conversations.updateStatus'(senderId, status) {
            check(senderId, String);
            check(status, String);
            checkIfCan('incoming:w', findConversationProject(senderId));
            return Conversations.update({ _id: senderId }, { $set: { status } });
        },

        'conversations.delete'(senderId) {
            check(senderId, String);
            checkIfCan('incoming:w', findConversationProject(senderId));
            return Conversations.remove({ _id: senderId });
        },
    });
}
