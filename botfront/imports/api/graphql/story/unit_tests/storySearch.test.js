import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { Stories } from '../../../story/stories.collection';
import Examples from '../../examples/examples.model.js';
import {
    projectFixture,
    storyFixture,
    examplesFixture,
    storyId,
    enModelId,
    frModelId,
    projectId,
    botResponseFixture,
    botResponsesFixture,
} from './indexTestData';
import { indexStory } from '../../../story/stories.index';
import { Projects } from '../../../project/project.collection';
import { NLUModels } from '../../../nlu_model/nlu_model.collection';
import { createResponses } from '../../botResponses/mongo/botResponses';
import BotResponses from '../../botResponses/botResponses.model';

import StoryResolver from '../resolvers/storiesResolver';

if (Meteor.isServer) {
    const cleanup = async () => {
        await Stories.remove({});
        await BotResponses.deleteMany({ projectId });
        await Projects.remove({ _id: projectId });
        await NLUModels.remove({ _id: enModelId });
        await NLUModels.remove({ _id: frModelId });
    };

    const addData = async () => {
        await createResponses(projectId, [botResponseFixture]);
        await createResponses(projectId, botResponsesFixture);
        await Examples.insertMany(examplesFixture);
        await Projects.insert(projectFixture);
        await Stories.insert(storyFixture);
        const { textIndex } = await indexStory(storyId);
        Stories.update({ _id: storyId }, { $set: { textIndex, type: 'story' } });
    };

    const insertDataAndIndex = async (done) => {
        await cleanup();
        await addData();
        done();
    };

    const removeTestData = async (done) => {
        await cleanup();
        done();
    };

    const searchStories = async (language, queryString, reject) => {
        try {
            const searchResult = await StoryResolver.Query.dialogueSearch(null, {
                projectId: 'bf',
                language,
                queryString,
            });
            if (!reject) {
                expect(searchResult.dialogueFragments[0]).to.be.deep.equal({
                    _id: 'TEST_STORY',
                    title: 'story fixture',
                    storyGroupId: 'TEST_STORY_GROUP',
                    type: 'story',
                });
            } else {
                expect(searchResult.dialogueFragments[0]).to.be.equal(undefined);
            }
        } catch (e) {
            throw new Error(
                `seaching stories for "${queryString}" did not return the expected results\n${e}`,
            );
        }
    };

    describe('test searching stories by their index', () => {
        before((done) => {
            insertDataAndIndex(done);
        });
        after((done) => {
            removeTestData(done);
        });
        it('should get the expected results from a search string', async (done) => {
            try {
                await searchStories('en', 'morning');
                await searchStories('fr', 'matin');
                await searchStories('en', 'timeOfDay');
                await searchStories('en', '123');
                await searchStories('en', 'button_intent');
                await searchStories('en', 'buttonEntity');
                await searchStories('en', 'second');
                await searchStories('en', 'http://google.com');
                await searchStories('en', 'Canada');
                await searchStories('en', 'test_slot');
                await searchStories('en', 'story fixture'); // (title)
                await searchStories('en', 'term does not exist', true);
                done();
            } catch (e) {
                done(e);
            }
        });
    });
}
