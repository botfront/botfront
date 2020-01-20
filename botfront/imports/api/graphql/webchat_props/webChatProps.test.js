import { expect } from 'chai';
import { getWebchatProps } from './webchatProps';
import { Stories } from '../../story/stories.collection';

const testStoryA = {
    projectId: 'bf',
    story_id: 'test_story_A',
    branches: [],
    title: 'test story',
    storyGroupId: 'test_story_group_A',
    story: '',
    rules: [
        {
            payload: 'test_payload_A',
            text: 'hello!',
            trigger: {
                device: 'desktop',
            },
        },
        {
            payload: 'test_payload_B',
            text: 'You\'re on a desktop computer!',
            trigger: {
                device: 'desktop',
            },
        },
    ],
};

const testStoryB = {
    projectId: 'bf',
    story_id: 'test_story_B',
    branches: [],
    title: 'test story',
    storyGroupId: 'test_story_group_A',
    story: '',
    rules: [
        {
            payload: 'test_payload_C',
            text: 'wow!',
            trigger: {
                device: 'desktop',
            },
        },
        {
            payload: 'test_payload_D',
            text: 'You\'re awesome!',
            trigger: {
                device: 'desktop',
            },
        },
    ],
};

const testStoryC = {
    projectId: 'bf',
    story_id: 'test_story_C',
    branches: [],
    title: 'test story',
    storyGroupId: 'test_story_group_A',
    story: '',
    rules: [],
};

const testStoryD = {
    projectId: 'bf',
    story_id: 'test_story_D',
    branches: [],
    title: 'test story',
    storyGroupId: 'test_story_group_A',
    story: '',
};

const expectedRules = [
    {
        payload: 'test_payload_A',
        text: 'hello!',
        trigger: {
            device: 'desktop',
        },
    },
    {
        payload: 'test_payload_B',
        text: 'You\'re on a desktop computer!',
        trigger: {
            device: 'desktop',
        },
    },
    {
        payload: 'test_payload_C',
        text: 'wow!',
        trigger: {
            device: 'desktop',
        },
    },
    {
        payload: 'test_payload_D',
        text: 'You\'re awesome!',
        trigger: {
            device: 'desktop',
        },
    },
];


describe('passing props to the webchat', () => {
    it('should get the expected props in the webchat', async () => {
        const initialize = new Promise(async (resolve) => {
            await Stories.insert(testStoryA);
            await Stories.insert(testStoryB);
            await Stories.insert(testStoryC);
            await Stories.insert(testStoryD);
            resolve();
        });
        expect(await initialize.then(async () => getWebchatProps('bf'))).to.be.deep.equal(expectedRules);
    });
});
