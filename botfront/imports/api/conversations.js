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
        checkIfCan('incoming:r', projectId);
        check(skip, Number);
        check(limit, Number);
        check(env, String);
        check(projectId, String);
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
        checkIfCan('incoming:r', projectId);
        check(_id, String);
        check(projectId, String);
        return Conversations.find({ _id, projectId });
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
    import { auditLog } from '../../server/logger';

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
            const conversationStatusBefore = Conversations.findOne({ _id: senderId }, { fields: { status: 1 } });
            auditLog('Changed conversation status', {
                user: Meteor.user(),
                projectId: findConversationProject(senderId),
                type: 'updated',
                operation: 'conversation-updated',
                resId: senderId,
                before: { status: conversationStatusBefore.status },
                after: { status },
                resType: 'conversation',
            });
            return Conversations.update({ _id: senderId }, { $set: { status } });
        },

        'conversations.delete'(senderId) {
            checkIfCan('incoming:w', findConversationProject(senderId));
            check(senderId, String);
            const conversationBefore = Conversations.find({ _id: senderId });
            auditLog('Deleted conversation', {
                user: Meteor.user(),
                projectId: findConversationProject(senderId),
                type: 'deleted',
                operation: 'conversation-deleted',
                resId: senderId,
                before: { conversationBefore },
                resType: 'conversation',
            });
            return Conversations.remove({ _id: senderId });
        },
    });
}
