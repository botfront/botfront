import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { traverseStory, aggregateEvents } from '../../lib/story.utils';

import { Stories } from './stories.collection';
import { deleteResponse, currateResponses } from '../graphql/botResponses/mongo/botResponses';

export const checkStoryNotEmpty = story => story.story && !!story.story.replace(/\s/g, '').length;

Meteor.methods({
    'stories.insert'(story) {
        check(story, Object);
        return Stories.insert(story);
    },

    async 'stories.update'(story) {
        check(story, Object);
        const {
            _id, path, ...rest
        } = story;
        console.log(story.branches);
        if (!path) {
            return Stories.update({ _id }, { $set: { ...rest } });
        }
        const originStory = Stories.findOne({ _id });
        const { events: oldEvents } = originStory;
        // passing story.story and path[(last index)] AKA storyBranchId to aggregate events allows it to aggregate events with the updated story md
        const newEvents = aggregateEvents(originStory, { ...rest, _id: path[path.length - 1] }); // path[(last index)] is the id of the updated branch

        const { indices } = traverseStory(originStory, path);
        const update = indices.length
            ? Object.assign(
                {},
                ...Object.keys(rest).map(key => (
                    { [`branches.${indices.join('.branches.')}.${key}`]: rest[key] }
                )),
            )
            : rest;
        const result = await Stories.update({ _id }, { $set: { ...update, events: newEvents } });

        // check if a response was removed
        const removedEvents = (oldEvents || []).filter(event => event.match(/^utter_/) && !newEvents.includes(event));
        console.log('removed: ', removedEvents.length);
        console.log('----------------------------------');
        currateResponses(removedEvents);
        return result;
    },

    'stories.currateResponses'(removeEvents, fromStoryId) {
        check(removeEvents, Array);
        check(fromStoryId, String);
        const sharedResponses = Stories.find({ events: { $in: removeEvents }, _id: { $ne: fromStoryId } }, { fields: { events: true } }).fetch();
        if (removeEvents.length > 0) {
            const deleteResponses = removeEvents.filter((event) => {
                if (!sharedResponses) return true;
                return !sharedResponses.find(({ events }) => events.includes(event));
            });
            deleteResponses.forEach(event => deleteResponse('bf', event));
        }
    },

    async 'stories.delete'(story) {
        check(story, Object);
        const result = await Stories.remove(story);
        currateResponses(story.events);
        return result;
    },

    'stories.getStories'(projectId) {
        check(projectId, String);
        return Stories.find({ projectId }).fetch();
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
