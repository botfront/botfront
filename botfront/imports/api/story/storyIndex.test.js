import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { Stories } from './stories.collection';
// test imports
import {
    projectFixture, storyFixture, enModelFixture, frModelFixture, storyId, enModelId, frModelId, projectId, botResponseFixture,
} from './indexTestData';
import { indexStory } from './stories.index';
import { Projects } from '../project/project.collection';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { createResponse, deleteResponse } from '../graphql/botResponses/mongo/botResponses';

import './stories.methods';

if (Meteor.isServer) {
    const testStoryIndexing = async (done) => {
        await deleteResponse(projectId, botResponseFixture.key);
        await Projects.remove({ _id: projectId });
        await NLUModels.remove({ _id: enModelId });
        await NLUModels.remove({ _id: frModelId });
        await Stories.remove({ _id: storyId });
        await createResponse(projectId, botResponseFixture);
        await NLUModels.insert({ ...enModelFixture });
        await NLUModels.insert(frModelFixture);
        await Projects.insert(projectFixture);
        await Stories.insert(storyFixture);
        const { textIndex } = await indexStory(storyId);
        Stories.update({ _id: storyId }, { $set: { textIndex } });
        expect(textIndex).to.be.deep.equal({
            contents: 'get_started \n get_started \n utter_get_started \n utter_get_started \n action_new \n test_slot',
            info: storyFixture.title,
        });
        done();
    };

    const testStorySearch = async (query, searchInProject, language, done) => {
        Meteor.call('stories.search', searchInProject, language, query, (e, r) => {
            expect(r[0]).to.be.deep.equal({ _id: 'TEST_STORY', title: 'Get started' });
            expect(r.length).to.be.equal(1);
            done();
        });
    };
    // ------ test suite -------
    describe.only('limit tests', () => {
        it('should index the story', (done) => {
            testStoryIndexing(done);
        });
        it('get the expected results from a search string', (done) => {
            testStorySearch('welcome', projectId, 'en', done);
        });
    });
}
