import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import uuidv4 from 'uuid/v4';
import shortid from 'shortid';
import { checkIfCan } from '../../lib/scopes';
import { traverseStory } from '../../lib/story.utils';
import { indexStory } from './stories.index';

import { Stories } from './stories.collection';
import { StoryGroups } from '../storyGroups/storyGroups.collection';
import { deleteResponsesRemovedFromStories } from '../graphql/botResponses/mongo/botResponses';
import { auditLogIfOnServer } from '../../lib/utils';
import { getTriggerIntents } from '../graphql/story/mongo/stories';

export const checkStoryNotEmpty = story => story.story && !!story.story.replace(/\s/g, '').length;

const logStoryUpdate = (story, projectId, originStory) => auditLogIfOnServer('Story updated', {
    resId: Array.isArray(story) ? story.map(({ _id }) => _id).join(', ') : story._id,
    user: Meteor.user(),
    type: 'updated',
    projectId,
    operation: 'stories.updated',
    after: { story },
    before: { story: originStory },
    resType: (Array.isArray(story) && story.length > 1) ? 'stories' : 'story',
});

Meteor.methods({
    async 'stories.insert'(story) {
        const projectId = Array.isArray(story) ? story[0].projectId : story.projectId;
        checkIfCan('stories:w', projectId);
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
        auditLogIfOnServer('Stories created', {
            user: Meteor.user(),
            type: 'created',
            resId: result,
            projectId,
            operation: 'stories.created',
            after: { story },
            resType: 'story',
        });

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

    async 'stories.changeStatus'(projectId, oldStatus, newStatus) {
        checkIfCan('stories:w', projectId);
        check(projectId, String);
        check(oldStatus, String);
        check(newStatus, String);
        const storiesToUpdate = Stories.find({ projectId, status: oldStatus }, { fields: { projectId: 1, status: 1 } }).fetch();
        const updatedStories = storiesToUpdate.map(story => ({ ...story, status: newStatus }));
        return Meteor.call('stories.update', updatedStories);
    },

    async 'stories.update'(story, options = {}) {
        const projectId = Array.isArray(story) ? story[0].projectId : story.projectId;
        checkIfCan('stories:w', projectId);
        check(story, Match.OneOf(Object, [Object]));
        check(options, Object);
        const { noClean } = options;
        if (Array.isArray(story)) {
            if (story.some(s => s.projectId !== projectId)) throw new Error(); // ensure homegeneous set
            const originStories = Stories.find({ _id: { $in: story.map(({ _id }) => _id) } }).fetch();
            logStoryUpdate(story, projectId, originStories);
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
            logStoryUpdate(story, projectId, originStory);
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
        logStoryUpdate(story, projectId, originStory);
        return result;
    },

    async 'stories.delete'(story) {
        checkIfCan('stories:w', story.projectId);
        check(story, Object);
        const storyInDb = Stories.findOne({ _id: story._id });
        const result = StoryGroups.update(
            { _id: story.storyGroupId },
            { $pull: { children: story._id } },
        );
        Stories.remove(story);
        deleteResponsesRemovedFromStories(storyInDb.events, story.projectId);
        auditLogIfOnServer('Story deleted', {
            resId: story._id,
            user: Meteor.user(),
            type: 'deleted',
            operation: 'stories.deleted',
            projectId: story.projectId,
            before: { storyInDb },
            resType: 'story',
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
            type: 'updated',
            operation: 'stories.updated',
            before: { story: storyBefore },
            after: { story: { ...storyBefore, checkpoints: [...checkpointsBefore, branchPath] } },
            resType: 'story',
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
            type: 'updated',
            operation: 'stories.updated',
            after: { story: storyAfter },
            before: { story: storyBefore },
            resType: 'story',
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
        if (!storyBefore.triggerIntent) {
            update.triggerIntent = `trigger_${shortid.generate()}`;
        }
        update.rules = story.rules.map(rule => (
            { ...rule, payload: `/${storyBefore.triggerIntent || update.triggerIntent}` }
        ));
        auditLogIfOnServer('Story updated trigger rules', {
            resId: storyId,
            user: Meteor.user(),
            projectId,
            type: 'updated',
            operation: 'stories.updated',
            after: { story },
            before: { story: storyBefore },
            resType: 'story',
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
            type: 'updated',
            projectId,
            operation: 'stories.updated',
            before: { story: storyBefore },
            after: { story: { ...storyBefore, rules: [] } },
            resType: 'story',
        });
        Stories.update(
            { projectId, _id: storyId },
            { $set: { rules: [] } },
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
    async 'stories.getTriggerIntents'(projectId, options = {}) {
        checkIfCan('stories:r', projectId);
        check(projectId, String);
        check(options, Object);
        if (Object.keys(options)) {
            return getTriggerIntents(projectId, options);
        }
        return getTriggerIntents(projectId);
    },
});
