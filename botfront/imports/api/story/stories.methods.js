import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import uuidv4 from 'uuid/v4';
import shortid from 'shortid';
import axios from 'axios';
import { checkIfCan } from '../../lib/scopes';
import { indexStory } from './stories.index';
import { Instances } from '../instances/instances.collection';

import { Stories } from './stories.collection';
import Conversations from '../graphql/conversations/conversations.model';
import { StoryGroups } from '../storyGroups/storyGroups.collection';
import { deleteResponsesRemovedFromStories } from '../graphql/botResponses/mongo/botResponses';
import { auditLogIfOnServer, formatError } from '../../lib/utils';
import { getTriggerIntents } from '../graphql/story/mongo/stories';
import { convertTrackerToStory } from '../../lib/test_case.utils';


import { langFromCode } from '../../lib/languages';

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
        checkIfCan(['stories:w', 'import:x'], projectId);
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
            result = [Stories.insert({ ...story, ...indexStory(story) })];
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
        if ((Array.isArray(updatedStories) && updatedStories.length > 0)) {
            return Meteor.call('stories.update', updatedStories);
        }
    },

    async 'stories.update'(story, options = {}) {
        const projectId = Array.isArray(story) ? story[0].projectId : story.projectId;
        checkIfCan('stories:w', projectId);
        check(story, Match.OneOf(Object, [Object]));
        check(options, Object);
        if (Array.isArray(story)) {
            if (story.some(s => s.projectId !== projectId)) throw new Error(); // ensure homegeneous set
            const originStories = Stories.find({ _id: { $in: story.map(({ _id }) => _id) } }).fetch();
            logStoryUpdate(story, projectId, originStories);
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
            logStoryUpdate(story, projectId, originStory);
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
        deleteResponsesRemovedFromStories(removedEvents, projectId, Meteor.user());
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
        await deleteResponsesRemovedFromStories(storyInDb.events, story.projectId, Meteor.user());
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
            { _id: destinationStory, type: 'story' },
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
            { _id: destinationStory, type: 'story' },
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
        update.rules = story.rules;
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
            { projectId, _id: storyId, type: storyBefore.type },
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
            { projectId, _id: storyId, type: storyBefore.type },
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

    async 'stories.addTestCase'(projectId, trackerId) {
        checkIfCan('stories:w', projectId);
        check(projectId, String);
        check(trackerId, String);
        const convo = await Conversations.findOne({ _id: trackerId, projectId }).lean();
        if (!convo) throw new Meteor.Error(404, 'Conversation not found');
        const { metadata: { language } = {} } = convo.tracker.events.find(event => event.metadata?.language) || {};
        if (!language) throw new Meteor.Error(404, 'Could not find conversation language');
        const steps = convertTrackerToStory(convo.tracker);
        const storyGroup = await StoryGroups.findOne({ projectId, pinned: false }, { sort: { updatedAt: -1 } });
        const newTestStory = {
            type: 'test_case',
            storyGroupId: storyGroup._id,
            title: `test_story_${shortid.generate()}`,
            projectId,
            steps,
            language,
            status: 'published',
        };
        await Meteor.callWithPromise('stories.insert', newTestStory);
    },

    async 'test_case.overwrite'(projectId, storyId) {
        checkIfCan('stories:w', projectId);
        check(projectId, String);
        check(storyId, String);
        const story = Stories.findOne({ projectId, _id: storyId }, {
            fields: {
                _id: 1, projectId: 1, testResults: 1, success: 1,
            },
        });
        const updatedSteps = story.testResults.reduce((acc, step) => {
            const updatedStep = step;
            if (!step.theme || step.theme === 'actual') {
                delete updatedStep.theme;
                return [...acc, updatedStep];
            }
            return acc;
        }, []);
        const update = {
            ...story, steps: updatedSteps, success: true, testResults: [],
        };
        await Meteor.call('stories.update', update);
    },
});


if (Meteor.isServer) {
    import {
        getAppLoggerForFile,
        getAppLoggerForMethod,
        addLoggingInterceptors,
        auditLog,
    } from '../../../server/logger';

    const storiesAppLogger = getAppLoggerForFile(__filename);

    Meteor.methods({
        async 'stories.runTests'(projectId, options = {}) {
            checkIfCan('stories:w', projectId);
            check(projectId, String);
            check(options, Object);
            try {
                const { ids, language } = options;
                const query = {
                    type: 'test_case',
                    projectId,
                    ...(ids?.length > 0 ? { _id: { $in: ids } } : {}),
                    ...(language ? { language } : {}),
                };
                const testCases = Stories.find({ ...query }, { fields: { _id: 1, steps: 1, language: 1 } })
                    .map(({
                        _id, steps, language: testLanguage,
                    }) => ({
                        _id,
                        steps,
                        language: testLanguage,
                    }));
                if (testCases?.length < 1) {
                    if (language) {
                        throw new Meteor.Error(400, `No tests were found for language: ${langFromCode(language)}`);
                    }
                    if (Array.isArray(ids)) {
                        throw new Meteor.Error(400, `Requested test${ids?.length > 1 ? 's' : ''} not found`);
                    }
                    throw new Meteor.Error(400, 'This project contains no tests');
                }
                const instance = await Instances.findOne({ projectId });
                const client = axios.create({
                    baseURL: instance.host,
                    timeout: 1000 * 1000,
                });

                auditLog('test model', {
                    user: Meteor.user(),
                    projectId,
                    type: 'execute',
                    operation: 'stories.runTests',
                    resId: testCases.map(({ _id }) => _id),
                    resType: 'run test cases',
                });
                const appMethodLogger = getAppLoggerForMethod(
                    storiesAppLogger,
                    'stories.runTests',
                    Meteor.userId(),
                    { projectId },
                );
                addLoggingInterceptors(client, appMethodLogger);
                const response = await client.request({
                    url: '/webhooks/bot_regression_test/run',
                    data: { test_cases: testCases, project_id: projectId },
                    method: 'post',
                });
                let report;
                if (response.status === 200) {
                    const testResults = response.data;
                    report = testResults.reduce((acc, { success }) => {
                        if (success) {
                            acc.passing += 1;
                        } else {
                            acc.failing += 1;
                        }
                        return acc;
                    }, { passing: 0, failing: 0 });
                    Meteor.call('stories.update', testResults);
                }
                return report;
            } catch (e) {
                if (e?.isAxiosError) {
                    throw new Meteor.Error(
                        e?.response?.status
                            || 500,
                        e?.response?.statusText
                            || 'An unexpected error occured',
                    );
                }
                throw formatError(e);
            }
        },
    });
}
