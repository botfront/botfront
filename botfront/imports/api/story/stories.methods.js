import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import uuidv4 from 'uuid/v4';
import { traverseStory } from '../../lib/story.utils';
import { indexStory } from './stories.index';

import { Stories } from './stories.collection';
import { StoryGroups } from '../storyGroups/storyGroups.collection';
import { deleteResponsesRemovedFromStories } from '../graphql/botResponses/mongo/botResponses';

export const checkStoryNotEmpty = story => story.story && !!story.story.replace(/\s/g, '').length;

Meteor.methods({
    async 'stories.insert'(story) {
        check(story, Match.OneOf(Object, [Object]));
        let result;
        const storyGroups = {};
        if (Array.isArray(story)) {
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

    async 'stories.update'(story, projectId, options = {}) {
        check(story, Match.OneOf(Object, [Object]));
        check(projectId, String);
        check(options, Object);
        const { noClean } = options;
        if (Array.isArray(story)) {
            const originStories = Stories.find({ _id: { $in: story.map(({ _id }) => _id) } }).fetch();
            return story.map(({ _id, ...rest }) => Stories.update(
                { _id },
                {
                    $set: {
                        ...rest,
                        ...indexStory(originStories.find(({ sid }) => sid === _id) || {}, { includeEventsField: true, update: { ...rest, _id } }),
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

    async 'stories.delete'(story, projectId) {
        check(story, Object);
        check(projectId, String);
        const result = StoryGroups.update(
            { _id: story.storyGroupId },
            { $pull: { children: story._id } },
        );
        Stories.remove(story);
        deleteResponsesRemovedFromStories(story.events, projectId);
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
});
