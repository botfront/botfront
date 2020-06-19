/* eslint-disable no-multi-str */
import { expect } from 'chai';
import { Meteor } from 'meteor/meteor';
import { importSubmissions } from './forms';

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
                environment: 'staging',
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
}
