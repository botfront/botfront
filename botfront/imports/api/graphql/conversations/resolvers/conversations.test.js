/* eslint-disable no-multi-str */
import { expect } from 'chai';
import { Meteor } from 'meteor/meteor';


if (Meteor.isServer) {
    import Conversations from '../conversations.model.js';
    import { conversationTemplate } from './conversations.test.data';
    import resolvers from './conversationsResolver';

    const {
        Mutation: { importConversations },
    } = resolvers;
    
    const generateConversationFromTemplate = ({ senderId, latestEventTime } = {}) => ({
        ...conversationTemplate,
        tracker: {
            ...conversationTemplate.tracker,
            ...(senderId ? { sender_id: senderId } : {}),
            ...(latestEventTime ? { latest_event_time: latestEventTime } : {}),
        },
    });
    describe('Import Conversations Route', () => {
        beforeEach(async () => {
            await Conversations.deleteMany();
            const result = await importConversations(null, {
                conversations: [generateConversationFromTemplate()],
                projectId: 'project1',
                environment: 'development',
            });
            expect(result).to.deep.equal({
                failed: [],
                nTotal: 1,
                nPushed: 1,
                nInserted: 1,
                nUpdated: 0,
            });
        });
        after(() => Conversations.deleteMany({}));
        it('should skip older convs, update newer', async () => {
            const result = await importConversations(null, {
                conversations: [
                    generateConversationFromTemplate({
                        latestEventTime: '1589481113.9532266',
                    }), // same sender, before
                    generateConversationFromTemplate({
                        latestEventTime: '1589481115.9532266',
                    }), // same sender, after
                    generateConversationFromTemplate({
                        senderId: 'other',
                        latestEventTime: '1589481113.9532266',
                    }), // diff sender, before
                    generateConversationFromTemplate({
                        senderId: 'other',
                        latestEventTime: '1589481115.9532266',
                    }), // diff sender, after
                ],
                projectId: 'project1',
                environment: 'development',
            });
            expect(result).to.deep.equal({
                failed: [],
                nTotal: 4,
                nPushed: 2,
                nInserted: 1,
                nUpdated: 1,
            });
        });
        it('should include older conv if different project', async () => {
            // also should fail if same senderId with different project (since senderId is db key)
            const result = await importConversations(null, {
                conversations: [
                    generateConversationFromTemplate({
                        latestEventTime: '1589481113.9532266',
                    }), // same sender, before
                    generateConversationFromTemplate({
                        senderId: 'other',
                        latestEventTime: '1589481113.9532266',
                    }), // diff sender, before
                ],
                projectId: 'project2', // diff project
                environment: 'development',
            });
            expect(result).to.deep.equal({
                failed: ['839676060a2f44b18724e12c9827c9bf'],
                nTotal: 2,
                nPushed: 2,
                nInserted: 1,
                nUpdated: 0,
            });
        });
        it('should include older conv if different env', async () => {
            // also should fail if same senderId with different project (since senderId is db key)
            const result = await importConversations(null, {
                conversations: [
                    generateConversationFromTemplate({
                        latestEventTime: '1589481113.9532266',
                    }), // same sender, before
                    generateConversationFromTemplate({
                        senderId: 'other',
                        latestEventTime: '1589481113.9532266',
                    }), // diff sender, before
                ],
                projectId: 'project1',
                environment: 'production', // diff env
            });
            expect(result).to.deep.equal({
                failed: ['839676060a2f44b18724e12c9827c9bf'],
                nTotal: 2,
                nPushed: 2,
                nInserted: 1,
                nUpdated: 0,
            });
        });
    });
}
