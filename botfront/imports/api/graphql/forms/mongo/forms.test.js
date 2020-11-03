/* eslint-disable no-multi-str */
import { expect } from 'chai';
import { Meteor } from 'meteor/meteor';
import { importSubmissions, upsertForm } from './forms';
import Forms from '../forms.model';
import { Slots } from '../../../slots/slots.collection';

import { createTestUser, removeTestUser } from '../../../testUtils';


import {
    testForm, slots, formUpdateData, expectedRemainingSlots, otherForm,
} from './formTestData';

const formSubmissionTemplate = {
    conversationId: 'conversationId',
    environment: 'development',
    projectId: 'project1',
    date: '2020-06-05T12:58:48.856Z',
};

if (Meteor.isServer) {
    import FormResults from '../form_results.model';

    describe('Import Form Submissions Route', () => {
        beforeEach(async () => {
            await FormResults.deleteMany();
            await FormResults.insertMany([formSubmissionTemplate]);
        });
        after(() => FormResults.deleteMany({}));
        it('should skip older submissions, insert newer', async () => {
            const result = await importSubmissions({
                form_results: [
                    { ...formSubmissionTemplate, date: '2020-06-05T12:57:48.856Z' }, // older
                    { ...formSubmissionTemplate, date: '2020-06-05T12:59:48.856Z' }, // newer
                    { ...formSubmissionTemplate, date: '2020-06-05T12:58:48.856Z' }, // same
                    {
                        ...formSubmissionTemplate,
                        date: '2020-06-05T12:58:48.856Z',
                        conversationId: 'other',
                    }, // same, different conversation
                ],
                projectId: 'project1',
                environment: 'development',
            });
            expect(result).to.deep.equal({
                failed: [],
                nTotal: 4,
                nPushed: 3,
                nInserted: 2,
                nUpdated: 1,
            });
        });
        it('should insert older submissions to different project', async () => {
            const result = await importSubmissions({
                form_results: [
                    { ...formSubmissionTemplate, date: '2020-06-05T12:57:48.856Z' }, // older
                ],
                projectId: 'project2',
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
        it('should insert older submissions to different env', async () => {
            const result = await importSubmissions({
                form_results: [
                    { ...formSubmissionTemplate, date: '2020-06-05T12:57:48.856Z' }, // older
                ],
                projectId: 'project1',
                environment: 'production',
            });
            expect(result).to.deep.equal({
                failed: [],
                nTotal: 1,
                nPushed: 1,
                nInserted: 1,
                nUpdated: 0,
            });
        });
    });

    let testUser = null;
    describe('delete unused slots on form upsert', () => {
        beforeEach(done => (async () => {
            await removeTestUser();
            await Forms.deleteMany();
            await Slots.remove({ projectId: 'bf' });
            testUser = await createTestUser();
            done();
        })());
        after(done => (async () => {
            await removeTestUser();
            await Forms.deleteMany();
            await Slots.remove({ projectId: 'bf' });
            done();
        })());
        it('should delete unfeaturized slots', done => (async () => {
            await Forms.update({ _id: testForm._id }, testForm, { upsert: true });
            await Promise.all(slots.map(slot => Slots.insert(slot)));
            await upsertForm({ form: otherForm }, testUser);
            await upsertForm(formUpdateData, testUser);
            const remainingSlots = Slots.find().fetch();
            expect(remainingSlots).to.deep.equal(expectedRemainingSlots);
            done();
        })());
    });
}
