import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import uuidv4 from 'uuid/v4';
import { traverseStory } from '../../lib/story.utils';
import { indexStory } from './stories.index';

import { Stories } from './stories.collection';
import { StoryGroups } from '../storyGroups/storyGroups.collection';
import { Projects } from '../project/project.collection';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import BotResponses from '../graphql/botResponses/botResponses.model';
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
            return story.map(({ _id, ...rest }) => Stories.update(
                { _id },
                {
                    $set: {
                        ...rest,
                        ...indexStory(rest, { includeEventsField: true }),
                    },
                },
            ));
        }
        const { _id, path, ...rest } = story;
        if (!path) {
            if (story.story || story.branches) {
                rest.textIndex = indexStory(story);
            }
            if (story.title) {
                rest.textIndex.title = story.title;
            }
            return Stories.update({ _id }, { $set: { ...rest } });
        }
        const originStory = Stories.findOne({ _id });
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
    async 'stories.search'(projectId, language, search) {
        check(projectId, String);
        check(language, String);
        check(search, String);
        const project = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } });
        const nluModels = project.nlu_models;
        const searchRegex = new RegExp(search);
        const model = NLUModels.findOne(
            { _id: { $in: nluModels }, language },
        );
        const modelExamples = model.training_data.common_examples;
        const intents = modelExamples.reduce((filtered, option) => {
            if (searchRegex.test(option.text)) {
                return [...filtered, option.intent];
            }
            return filtered;
        }, []);
        const matchedResponses = await BotResponses.find(
            { $text: { $search: search } },
        ).lean();
        const responseKeys = matchedResponses.map(({ key }) => key);
        const matched = Stories.find(
            { projectId, $text: { $search: `${search} ${intents.join(' ')} ${responseKeys.join(' ')}` } },
            { fields: { _id: 1, title: 1 } },
        ).fetch();
        return matched;
    },
});
