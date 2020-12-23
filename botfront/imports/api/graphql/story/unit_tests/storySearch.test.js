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
    botResponsesFixtureWithCustomCss,
    botResponsesFixtureWithHighlight,
    botResponseFixtureWithObserve,
} from './indexTestData';
import { indexStory } from '../../../story/stories.index';
import { Projects } from '../../../project/project.collection';
import { NLUModels } from '../../../nlu_model/nlu_model.collection';
import { createResponses } from '../../botResponses/mongo/botResponses';
import BotResponses from '../../botResponses/botResponses.model';
import { caught } from '../../../../lib/client.safe.utils';

import StoryResolver from '../resolvers/storiesResolver';
import { createTestUser, removeTestUser } from '../../../testUtils';

if (Meteor.isServer) {
    import { setUpRoles } from '../../../roles/roles';

    setUpRoles();

    const userId = 'testuserid';

    const cleanup = async () => {
        await Stories.remove({});
        await Examples.remove({});
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

    const insertDataAndIndex = async () => {
        await cleanup();
        await removeTestUser();
        await createResponses(projectId, [
            botResponsesFixtureWithCustomCss,
            botResponsesFixtureWithHighlight,
            botResponseFixtureWithObserve,
        ]);
        await addData();
        await createTestUser();
    };

    const removeTestData = async () => {
        await cleanup();
        await removeTestUser();
    };

    const searchStories = async (language, queryString, reject) => {
        try {
            const searchResult = await StoryResolver.Query.dialogueSearch(
                null,
                {
                    projectId: 'bf',
                    language,
                    queryString,
                },
                { user: { _id: userId } },
            );
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
        before(caught(insertDataAndIndex));
        after(caught(removeTestData));
        it('should get the expected results from a search string', caught(async () => {
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
        }));
        it('should be able to use smart search', caught(async () => {
            await searchStories('en', 'status:published second');
            await searchStories('en', 'status:unpublished', true);
            await searchStories('en', 'with:highlights');
            await searchStories('en', 'with:highlights second');
            await searchStories('en', 'with:custom_style');
            await searchStories('en', 'with:custom_style story fixture');
            await searchStories('en', 'with:triggers');
            await searchStories('en', 'with:triggers Canada');
            await searchStories(
                'en',
                'with:custom_style story fixture with:highlights with:triggers',
            );
            await searchStories('en', 'with:observe_events');
            await searchStories(
                'en',
                'with:observe_events string not in the story',
                true,
            );
            await searchStories('en', 'with:some_non_existing_search', true);
        }));
    });
}
