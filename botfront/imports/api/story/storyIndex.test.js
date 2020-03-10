import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { Stories } from './stories.collection';
// test imports
import {
    projectFixture, storyFixture, enModelFixture, frModelFixture, storyId, enModelId, frModelId, projectId, botResponseFixture,
} from './indexTestData';
import { indexStory, searchStories } from './stories.index';
import { Projects } from '../project/project.collection';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import BotResponses from '../graphql/botResponses/botResponses.model';

if (Meteor.isServer) {
    const testStoryIndexing = async (done) => {
        await BotResponses.deleteOne({ _id: botResponseFixture._id });
        await BotResponses.find();
        await Projects.remove({ _id: projectId });
        await NLUModels.remove({ _id: enModelId });
        await NLUModels.remove({ _id: frModelId });
        await Stories.remove({ _id: storyId });
        await BotResponses.updateOne({ _id: botResponseFixture._id }, botResponseFixture, { upsert: true });
        await NLUModels.insert({ ...enModelFixture });
        await NLUModels.insert(frModelFixture);
        await Projects.insert(projectFixture);
        await Stories.insert(storyFixture);
        const newIndex = await indexStory(storyId, { updateIndex: true });
        Stories.update({ _id: storyId }, { $set: { searchIndex: newIndex } });
        done();
    };

    const testStorySearch = async (query, searchInProject, language, done) => {
        console.log(await Stories.findOne({ _id: storyId }, { fields: { searchIndex: 1 } }));
        const result = Meteor.call('stories.search', searchInProject, language, query, (e, r) => {
            console.log(e, r);
        });
        console.log(result);
        done();
    };
    // ------ test suite -------
    describe.only('limit tests', () => {
        it('should index the story', (done) => {
            testStoryIndexing(done);
        });
        it('get the expected results from a search string', (done) => {
            // testStoryIndexing(done)
            testStorySearch('bienvenue', projectId, 'fr', done);
        });
    });
}
