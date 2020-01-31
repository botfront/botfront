import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { checkIfCan } from '../../lib/scopes';
import { traverseStory, aggregateEvents } from '../../lib/story.utils';
import { Stories } from './stories.collection';
import { deleteResponsesRemovedFromStories } from '../graphql/botResponses/mongo/botResponses';

export const checkStoryNotEmpty = story => story.story && !!story.story.replace(/\s/g, '').length;

Meteor.methods({
    'stories.insert'(story) {
        check(story, Object);
        checkIfCan('stories:w', story.projectId);
        return Stories.insert(story);
    },

    async 'stories.update'(story, projectId) {
        check(story, Object);
        check(projectId, String);
        checkIfCan('stories:w', story.projectId);
        const { _id, path, ...rest } = story;
        if (!path) {
            return Stories.update({ _id }, { $set: { ...rest } });
        }
        const originStory = Stories.findOne({ _id });
        const { events: oldEvents } = originStory || {};
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
        deleteResponsesRemovedFromStories(removedEvents, projectId);
        return result;
    },

    async 'stories.delete'(story, projectId) {
        check(story, Object);
        check(projectId, String);
        checkIfCan('stories:w', story.projectId);
        const result = await Stories.remove(story);
        deleteResponsesRemovedFromStories(story.events, projectId);
        return result;
    },

    'stories.getStories'(projectId) {
        check(projectId, String);
        checkIfCan('stories:r', projectId);
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
    async 'stories.updateRules'(projectId, storyId, story) {
        check(projectId, String);
        check(storyId, String);
        check(story, Object);
        const update = {};

        update.rules = story.rules.map(rule => ({ ...rule, payload: `/trigger_${storyId}` }));
        Stories.update(
            { projectId, _id: storyId },
            { $set: update },
        );
    },
    async 'stories.deleteRules'(projectId, storyId) {
        check(projectId, String);
        check(storyId, String);
        Stories.update(
            { projectId, _id: storyId },
            { $set: { rules: [] } },
        );
    },
});
