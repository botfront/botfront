import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import uuidv4 from 'uuid/v4';
import { checkIfCan } from '../../lib/scopes';
import { traverseStory, aggregateEvents } from '../../lib/story.utils';
import { Stories } from './stories.collection';
import { deleteResponsesRemovedFromStories } from '../graphql/botResponses/mongo/botResponses';
import { auditLogIfOnServer } from '../../lib/utils';

export const checkStoryNotEmpty = story => story.story && !!story.story.replace(/\s/g, '').length;

Meteor.methods({
    'stories.insert'(story) {
        checkIfCan('stories:w', Array.isArray(story) ? story[0].projectId : story.projectId);
        check(story, Match.OneOf(Object, [Object]));
        if (Array.isArray(story)) {
            return Stories.rawCollection().insertMany(story
                .map(s => ({
                    ...s,
                    ...(s._id ? {} : { _id: uuidv4() }),
                    events: aggregateEvents(s),
                })));
        }
        auditLogIfOnServer('Story created', {
            user: Meteor.user(),
            type: 'create',
            projectId: story.projectId,
            operation: 'stories.created',
            after: { story },
        });
        return Stories.insert({ ...story, events: aggregateEvents(story) });
    },

    async 'stories.update'(story, projectId, options = {}) {
        checkIfCan('stories:w', story.projectId);
        check(story, Object);
        check(projectId, String);
        check(options, Object);
        const { noClean } = options;
        const {
            _id, path, ...rest
        } = story;

        if (!path) return Stories.update({ _id }, { $set: { ...rest } });
        const originStory = Stories.findOne({ _id });

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

        if (!noClean) { // check if a response was removed
            const { events: oldEvents } = originStory || {};
            const removedEvents = (oldEvents || []).filter(event => event.match(/^utter_/) && !newEvents.includes(event));
            deleteResponsesRemovedFromStories(removedEvents, projectId);
        }
        auditLogIfOnServer('Story updated', {
            resId: story._id,
            user: Meteor.user(),
            type: 'update',
            projectId,
            operation: 'stories.updated',
            after: { story },
            before: { story: originStory },
        });
        return result;
    },

    async 'stories.delete'(story, projectId) {
        checkIfCan('stories:w', story.projectId);
        check(story, Object);
        check(projectId, String);
        const result = await Stories.remove(story);
        deleteResponsesRemovedFromStories(story.events, projectId);
        auditLogIfOnServer('Story deleted', {
            resId: story._id,
            user: Meteor.user(),
            type: 'delete',
            operation: 'stories.deleted',
            projectId,
            before: { story },
        });
        return result;
    },

    'stories.addCheckpoints'(projectId, destinationStory, branchPath) {
        checkIfCan('stories:w', projectId);
        check(destinationStory, String);
        check(branchPath, Array);
        check(projectId, String);

        const storyBefore = Stories.findOne({ _id: destinationStory });
        const checkpointsBefore = storyBefore.checkpoints || [];
        auditLogIfOnServer('Story added checkpoint', {
            resId: destinationStory,
            user: Meteor.user(),
            type: 'update',
            operation: 'stories.updated',
            before: { story: storyBefore },
            after: { story: { ...storyBefore, checkpoints: [...checkpointsBefore, branchPath] } },
        });
        return Stories.update(
            { _id: destinationStory },
            { $addToSet: { checkpoints: branchPath } },
        );
    },
    'stories.removeCheckpoints'(projectId, destinationStory, branchPath) {
        // -permission- add a projectId
        checkIfCan('stories:w', projectId);
        check(destinationStory, String);
        check(branchPath, Array);
        check(projectId, String);
        const storyBefore = Stories.findOne({ _id: destinationStory });
        const result = Stories.update(
            { _id: destinationStory },
            { $pullAll: { checkpoints: [branchPath] } },
        );
        const storyAfter = Stories.findOne({ _id: destinationStory });
        auditLogIfOnServer('Story removed checkpoint', {
            resId: destinationStory,
            user: Meteor.user(),
            type: 'update',
            operation: 'stories.updated',
            after: { story: storyAfter },
            before: { story: storyBefore },

        });
        return result;
    },
    async 'stories.updateRules'(projectId, storyId, story) {
        checkIfCan('triggers:w', projectId);
        check(projectId, String);
        check(storyId, String);
        check(story, Object);
        const storyBefore = Stories.findOne({ projectId, _id: storyId });
        const update = {};
        update.rules = story.rules.map(rule => (
            { ...rule, payload: `/trigger_${storyId}` }
        ));
        auditLogIfOnServer('Story updated trigger rules', {
            resId: storyId,
            user: Meteor.user(),
            projectId,
            type: 'update',
            operation: 'stories.updated',
            after: { story },
            before: { story: storyBefore },

        });
        Stories.update(
            { projectId, _id: storyId },
            { $set: update },
        );
    },
    async 'stories.deleteRules'(projectId, storyId) {
        checkIfCan('triggers:w', projectId);
        check(projectId, String);
        check(storyId, String);
        const storyBefore = Stories.findOne({ projectId, _id: storyId });
        auditLogIfOnServer('Story deleted trigger rules', {
            resId: storyId,
            user: Meteor.user(),
            type: 'update',
            projectId,
            operation: 'stories.updated',
            before: { story: storyBefore },
            after: { story: { ...storyBefore, rules: [] } },
        });
        Stories.update(
            { projectId, _id: storyId },
            { $set: { rules: [] } },
        );
    },
});
