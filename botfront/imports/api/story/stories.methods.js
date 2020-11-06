import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import uuidv4 from 'uuid/v4';
import { indexStory } from './stories.index';

import { Stories } from './stories.collection';
import Conversations from '../graphql/conversations/conversations.model';
import { StoryGroups } from '../storyGroups/storyGroups.collection';
import { deleteResponsesRemovedFromStories } from '../graphql/botResponses/mongo/botResponses';
import { checkIfCan } from '../../lib/scopes';

export const checkStoryNotEmpty = story => story.story && !!story.story.replace(/\s/g, '').length;

Meteor.methods({
    async 'stories.insert'(story) {
        const projectId = Array.isArray(story) ? story[0].projectId : story.projectId;
        check(story, Match.OneOf(Object, [Object]));
        let result;
        const storyGroups = {};
        if (Array.isArray(story)) {
            const stories = story.map((s) => {
                if (s.projectId !== projectId) throw new Error(); // ensure homegeneous set
                const _id = s._id || uuidv4();
                storyGroups[s.storyGroupId] = [...(storyGroups[s.storyGroupId] || []), _id];
                return {
                    _id,
                    ...s,
                    ...indexStory(s),
                };
            });
            result = await Stories.rawCollection().insertMany(stories);
            result = Object.values(result.insertedIds);
        } else {
            console.log(story.type);
            result = [Stories.insert({ ...story, ...indexStory(story), ...(story.type === 'test_case' ? { status: 'unknown' } : {}) })];
            storyGroups[story.storyGroupId] = result;
        }
        return Object.keys(storyGroups).map((_id) => {
            const storyIds = storyGroups[_id].filter(id => result.includes(id));
            return StoryGroups.update(
                { _id },
                {
                    $push: { children: { $each: storyIds, $position: 0 } },
                    $set: { isExpanded: true },
                },
            );
        });
    },

    async 'stories.update'(story, options = {}) {
        const projectId = Array.isArray(story) ? story[0].projectId : story.projectId;
        check(story, Match.OneOf(Object, [Object]));
        check(options, Object);
        if (Array.isArray(story)) {
            if (story.some(s => s.projectId !== projectId)) throw new Error(); // ensure homegeneous set
            const originStories = Stories.find({ _id: { $in: story.map(({ _id }) => _id) } }).fetch();
            return story.map(({ _id, ...rest }) => Stories.update(
                { _id },
                {
                    $set: {
                        ...rest,
                        type: (originStories.find(({ _id: sid }) => sid === _id) || {}).type,
                        ...indexStory(originStories.find(({ _id: sid }) => sid === _id) || {}, { update: { ...rest, _id } }),
                    },
                },
            ));
        }
        const { _id, path, ...rest } = story;
        const originStory = Stories.findOne({ _id });

        if (!path) {
            return Stories.update({ _id }, {
                $set: {
                    ...rest,
                    type: originStory.type,
                    ...indexStory(originStory, { update: { ...rest, _id } }),
                },
            });
        }

        const { textIndex, events: newEvents } = indexStory(originStory, {
            update: { ...rest, _id: path[path.length - 1] },
        });
        const { indices } = path.slice(1)
            .reduce((acc, curr) => ({
                branches: acc.branches.find(b => b._id === curr)?.branches || [],
                indices: [...acc.indices, (acc.branches || []).findIndex(
                    branch => branch._id === curr,
                )],
            }), { branches: originStory.branches || [], indices: [] });
        const update = indices.length
            ? Object.assign(
                {},
                ...Object.keys(rest).map(key => ({
                    [`branches.${indices.join('.branches.')}.${key}`]: rest[key],
                })),
            )
            : rest;
        const result = await Stories.update({ _id }, {
            $set: {
                type: originStory.type, ...update, events: newEvents, textIndex,
            },
        });

        // check if a response was removed
        const { events: oldEvents } = originStory || {};
        const removedEvents = (oldEvents || []).filter(
            event => event.match(/^utter_/) && !newEvents.includes(event),
        );
        deleteResponsesRemovedFromStories(removedEvents, projectId);
        return result;
    },

    async 'stories.delete'(story) {
        check(story, Object);
        const storyInDb = Stories.findOne({ _id: story._id });
        const result = StoryGroups.update(
            { _id: story.storyGroupId },
            { $pull: { children: story._id } },
        );
        Stories.remove(story);
        deleteResponsesRemovedFromStories(storyInDb.events, story.projectId);
        return result;
    },

    'stories.addCheckpoints'(projectId, destinationStory, branchPath) {
        checkIfCan('stories:w', projectId);
        check(projectId, String);
        check(destinationStory, String);
        check(branchPath, Array);
        return Stories.update(
            { _id: destinationStory, type: 'story' },
            { $addToSet: { checkpoints: branchPath } },
        );
    },
    'stories.removeCheckpoints'(projectId, destinationStory, branchPath) {
        checkIfCan('stories:w', projectId);
        check(projectId, String);
        check(destinationStory, String);
        check(branchPath, Array);
        return Stories.update(
            { _id: destinationStory, type: 'story' },
            { $pullAll: { checkpoints: [branchPath] } },
        );
    },

    async 'stories.includesResponse'(projectId, responseNames) {
        checkIfCan('stories:r', projectId);
        check(projectId, String);
        check(responseNames, Array);
        try {
            const allStories = Stories.find(
                { projectId, events: { $elemMatch: { $in: responseNames } } },
                {
                    fields: {
                        events: 1, _id: 1, title: 1, storyGroupId: 1,
                    },
                },
            ).fetch();
            return allStories.reduce((currentValue, {
                events, _id, title, storyGroupId,
            }) => {
                const nextValue = { ...currentValue };
                events.forEach((event) => {
                    if (!responseNames.includes(event)) return;
                    const responseInstances = nextValue[event];
                    if (responseInstances) {
                        nextValue[event] = [...responseInstances, { _id, title, storyGroupId }];
                        return;
                    }
                    nextValue[event] = [{ _id, title, storyGroupId }];
                });
                return nextValue;
            }, {});
        } catch (e) {
            return {};
        }
    },

    async 'stories.addTestCase'(projectId, trackerId) {
        checkIfCan('stories:w', projectId);
        check(projectId, String);
        check(trackerId, String);
        const convo = await Conversations.findOne({ _id: trackerId, projectId }).lean();
        if (!convo) throw new Meteor.Error(404, 'Conversation not found');
        const steps = [];
        convo.tracker.events.forEach((event) => {
            if (event.event === 'user') {
                steps.push({
                    user: event.text,
                    intent: event.parse_data.intent.name,
                });
            }
            if (event.event === 'action' && event.name.startsWith('utter')) {
                steps.push({
                    action: event.name,
                });
            }
        });
        const storyGroup = await StoryGroups.findOne({ projectId, pinned: false });
        const newTestStory = {
            type: 'test_case',
            storyGroupId: storyGroup._id,
            title: `test_story_${uuidv4()}`,
            projectId,
            steps,
        };
        await Meteor.callWithPromise('stories.insert', newTestStory);
    },
});
