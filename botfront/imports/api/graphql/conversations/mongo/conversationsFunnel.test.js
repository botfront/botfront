

import { expect } from 'chai';
import { Meteor } from 'meteor/meteor';
import { Conversations } from '../../../conversations';
import { getConversationsFunnel } from './conversationsFunnel';
import testData from './conversationsFunnel.test.data';

if (Meteor.isServer) {
    describe('Funnel aggregation', () => {
        before(done => (async () => {
            await Promise.all(testData.map(datum => Conversations.insert(datum)));
            done();
        })());

        after(done => (async () => {
            await Conversations.remove();
            done();
        })());


        it('Should properly check order without exclusions', done => (async () => {
            const funnelResults = await getConversationsFunnel({
                projectId: 'bf',
                selectedSequence: [{ name: 'hi', excluded: false },
                    { name: 'action_listen', excluded: false },
                    { name: 'no', excluded: false },
                    { name: 'no', excluded: false }],
                from: 1588291200,
                to: 1591142399.999,
                envs: ['development'],
                langs: ['en'],
            });
            expect(funnelResults).to.deep.equal([{ matchCount: 3, name: 'hi_0', proportion: '100.00' },
                { matchCount: 3, name: 'action_listen_1', proportion: '100.00' },
                { matchCount: 2, name: 'no_2', proportion: '66.67' },
                { matchCount: 1, name: 'no_3', proportion: '33.33' }]);
            done();
        })());

        it('Should properly check order with exclusions', done => (async () => {
            const funnelResults = await getConversationsFunnel({
                projectId: 'bf',
                selectedSequence: [{ name: 'hi', excluded: false },
                    { name: 'action_listen', excluded: false },
                    { name: 'yes', excluded: true },
                    { name: 'no', excluded: false }],
                from: 1588291200,
                to: 1591142399.999,
                envs: ['development'],
                langs: ['en'],
            });
            expect(funnelResults).to.deep.equal([{ matchCount: 3, name: 'hi_0', proportion: '100.00' },
                { matchCount: 3, name: 'action_listen_1', proportion: '100.00' },
                { matchCount: 1, name: 'NOT yes_2', proportion: '33.33' },
                { matchCount: 1, name: 'no_3', proportion: '33.33' }]);
            done();
        })());

        it('Should handle action and intents ', done => (async () => {
            const funnelResults = await getConversationsFunnel({
                projectId: 'bf',
                selectedSequence: [{ name: 'hi', excluded: false },
                    { name: 'action_listen', excluded: false }],
                from: 1588291200,
                to: 1591142399.999,
                envs: ['development'],
                langs: ['en'],
            });
            expect(funnelResults).to.deep.equal([{ matchCount: 3, name: 'hi_0', proportion: '100.00' }, { matchCount: 3, name: 'action_listen_1', proportion: '100.00' }]);
            done();
        })());


        it('Should handle sequences with doubles', done => (async () => {
            const funnelResults = await getConversationsFunnel({
                projectId: 'bf',
                selectedSequence: [{ name: 'hi', excluded: false },
                    { name: 'no', excluded: false },
                    { name: 'action_listen', excluded: false },
                    { name: 'no', excluded: false }],
                from: 1588291200,
                to: 1591142399.999,
                envs: ['development'],
                langs: ['en'],
            });
            expect(funnelResults).to.deep.equal([{ matchCount: 3, name: 'hi_0', proportion: '100.00' },
                { matchCount: 2, name: 'no_1', proportion: '66.67' },
                { matchCount: 2, name: 'action_listen_2', proportion: '66.67' },
                { matchCount: 1, name: 'no_3', proportion: '33.33' }]);
            done();
        })());
    });
}
