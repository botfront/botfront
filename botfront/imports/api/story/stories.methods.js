import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import uuidv4 from 'uuid/v4';
import { traverseStory } from '../../lib/story.utils';
import { indexStory } from './stories.index';

import { Stories } from './stories.collection';
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
            if (story.some(s => s.projectId !== projectId)) throw new Error(); // ensure homegeneous set
            const stories = story.map((s) => {
                const _id = s._id || uuidv4();
                storyGroups[s.storyGroupId] = [...(storyGroups[s.storyGroupId] || []), _id];
                return {
                    _id,
                    ...s,
                    ...indexStory(s, { includeEventsField: true }),
                };
            });
            result = await Stories.rawCollection().insertMany(stories);
            result = Object.values(result.insertedIds);
        } else {
            result = [Stories.insert({ ...story, ...indexStory(story, { includeEventsField: true }) })];
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
        const { noClean } = options;
        if (Array.isArray(story)) {
            if (story.some(s => s.projectId !== projectId)) throw new Error(); // ensure homegeneous set
            const originStories = Stories.find({ _id: { $in: story.map(({ _id }) => _id) } }).fetch();
            return story.map(({ _id, ...rest }) => Stories.update(
                { _id },
                {
                    $set: {
                        ...rest,
                        ...indexStory(originStories.find(({ _id: sid }) => sid === _id) || {}, { includeEventsField: true, update: { ...rest, _id } }),
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
                    ...indexStory(originStory, { includeEventsField: true, update: { ...rest, _id } }),
                },
            });
        }

        const { textIndex, events: newEvents } = indexStory(originStory, {
            update: { ...rest, _id: path[path.length - 1] },
            includeEventsField: true,
        });

        const { indices } = traverseStory(originStory, path);
        const update = indices.length
            ? Object.assign(
                {},
                ...Object.keys(rest).map(key => ({
                    [`branches.${indices.join('.branches.')}.${key}`]: rest[key],
                })),
            )
            : rest;
        const result = await Stories.update({ _id }, { $set: { ...update, events: newEvents, textIndex } });

        if (!noClean) {
            // check if a response was removed
            const { events: oldEvents } = originStory || {};
            const removedEvents = (oldEvents || []).filter(
                event => event.match(/^utter_/) && !newEvents.includes(event),
            );
            deleteResponsesRemovedFromStories(removedEvents, projectId);
        }
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

    'stories.addCheckpoints'(destinationStory, branchPath) {
        check(destinationStory, String);
        check(branchPath, Array);
        return Stories.update(
            { _id: destinationStory },
            { $addToSet: { checkpoints: branchPath } },
        );
    },
    'stories.removeCheckpoints'(destinationStory, branchPath) {
        check(destinationStory, String);
        check(branchPath, Array);
        return Stories.update(
            { _id: destinationStory },
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
});
