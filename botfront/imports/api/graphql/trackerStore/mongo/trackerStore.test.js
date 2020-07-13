import { expect } from 'chai';
import { Meteor } from 'meteor/meteor';
import {
    upsertTrackerStore,
    getTracker,
} from './trackerStore';
import {
    testConversation, testConversationEq, testConversationEqSlice, newTracker, newTrackerEq, updateTrackerEq,
} from './trackerStore.test.data';


if (Meteor.isServer) {
    import Conversations from '../../conversations/conversations.model';
    import Project from '../../project/project.model';
    
    const projectId = 'bf';
  

    const getATracker = async (done, id, eq, after = 0) => {
        try {
            const result = await getTracker(id, projectId, after);
            expect(result).to.be.deep.equal(eq);
            done();
        } catch (e) {
            done(e);
        }
    };


    const cleanUpDB = async (done) => {
        await Conversations.deleteMany({ projectId });
        done();
    };

    describe('trackerStore', () => {
        before(async (done) => {
            await Project.deleteMany({ _id: 'bf' });
            await Project.create({ _id: projectId, defaultLanguage: 'en' });
            done();
        });
        after(async (done) => {
            await Conversations.deleteMany({ projectId });
            await Project.deleteMany({ _id: projectId });
            done();
        });
        beforeEach((done) => {
            cleanUpDB(done);
        });
        it('Should get an empty tracker', (done) => {
            getATracker(done, 'Notexisting', undefined);
        });
        it('should get tracker', async (done) => {
            await Conversations.create(testConversation);
            getATracker(done, 'testid', testConversationEq);
        });
        it('should get tracker with sliced events', async (done) => {
            await Conversations.create(testConversation);
            getATracker(done, 'testid', testConversationEqSlice, 2);
        });
        it('should create a tracker', async (done) => {
            await upsertTrackerStore({ senderId: 'new', projectId, tracker: newTracker });
            const result = await Conversations.findOne({ _id: 'new' }).lean();
            const updateDate = result.updatedAt;
            delete result.updatedAt;
            try {
                expect(result).to.be.deep.equal(newTrackerEq);
                expect(new Date().getTime()).to.be.above(updateDate.getTime());
                expect(updateDate.getTime()).to.be.above(new Date().getTime() - 10000);
                done();
            } catch (e) {
                done(e);
            }
        });
        it('should update a tracker', async (done) => {
            await Conversations.create(testConversation);
        
            await upsertTrackerStore({ senderId: 'testid', projectId, tracker: newTracker });
            const result = await Conversations.findOne({ _id: 'testid' }).lean();
            const updateDate = result.updatedAt;
            delete result.updatedAt;
            try {
                expect(result).to.be.deep.equal(updateTrackerEq);
                expect(new Date().getTime()).to.be.above(updateDate.getTime());
                expect(updateDate.getTime()).to.be.above(new Date().getTime() - 10000);
                done();
            } catch (e) {
                done(e);
            }
        });
    });
}
