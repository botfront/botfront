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
        try {
            checkIfCan('incoming:r', projectId);
        } catch (e) {
            return this.ready();
        }
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
        return Conversations.find({ projectId, ...envSelector }, options);
    });

    Meteor.publish('conversation-detail', function(_id, projectId) {
        try {
            checkIfCan('incoming:r', projectId);
        } catch (e) {
            return this.ready();
        }
        check(_id, String);
        check(projectId, String);

        checkIfCan('incoming:r', projectId);
        return Conversations.find({ _id, projectId });
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
        checkIfCan('incoming:r', conversation.projectId);
        return conversation.projectId;
    };
    Meteor.methods({
        'conversations.markAsRead'(senderId) {
            checkIfCan('incoming:r', findConversationProject(senderId));
            check(senderId, String);
            return Conversations.update({ _id: senderId }, { $set: { status: 'read' } });
        },

        'conversations.updateStatus'(senderId, status) {
            checkIfCan('incoming:r', findConversationProject(senderId));
            check(senderId, String);
            check(status, String);
            return Conversations.update({ _id: senderId }, { $set: { status } });
        },

        'conversations.delete'(senderId) {
            checkIfCan('incoming:w', findConversationProject(senderId));
            check(senderId, String);
            return Conversations.remove({ _id: senderId });
        },
    });
}
