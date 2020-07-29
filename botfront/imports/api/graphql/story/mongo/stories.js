import { Stories } from '../../../story/stories.collection';
import { Projects } from '../../../project/project.collection';
import { NLUModels } from '../../../nlu_model/nlu_model.collection';
import BotResponses from '../../botResponses/botResponses.model';
import { indexStory } from '../../../story/stories.index';

const combineSearches = (search, responseKeys, intents) => {
    const searchRegex = [search];
    if (responseKeys.length) searchRegex.push(responseKeys.join('|'));
    if (intents.length) searchRegex.push(intents.join('|'));
    return searchRegex.join('|');
};

// eslint-disable-next-line no-useless-escape
const escape = string => string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

export const searchStories = async (projectId, language, search) => {
    const flags = {
        withTriggers: search.includes('with:triggers'),
        withHighlights: search.includes('with:highlights'),
        withCustomStyle: search.includes('with:custom_style'),
        withObserveEvents: search.includes('with:observe_events'),
        unpublishedStories: search.includes('status:unpublished'),
        publishedStories: search.includes('status:published'),
    };
    const stringToRemove = ['with:triggers', 'with:highlights', 'with:custom_style', 'status:unpublished', 'status:published', 'with:observe_events'];
    const cleanedSearch = search.replace(new RegExp(stringToRemove.join('|'), 'g'), '').trim();
    const project = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } });
    const nluModels = project.nlu_models;
    const escapedSearch = escape(cleanedSearch);
    const searchRegex = new RegExp(escapedSearch, 'i');
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
        { textIndex: { $regex: escapedSearch, $options: 'i' }, projectId },
    ).lean();
    let responsesWithHighlights = [];
    let responsesWithCustomStyle = [];
    let responsesWithObserveEvents = [];
    if (flags.withCustomStyle || flags.withHighlights || flags.withObserveEvents) {
        if (flags.withHighlights) {
            responsesWithHighlights = await BotResponses.find(
                { 'metadata.domHighlight': { $exists: true, $ne: null }, projectId },
            ).lean();
            responsesWithHighlights = responsesWithHighlights.map(({ key }) => key);
        }
        if (flags.withCustomStyle) {
            responsesWithCustomStyle = await BotResponses.find(
                { 'metadata.customCss': { $exists: true, $ne: null }, projectId },
            ).lean();
            responsesWithCustomStyle = responsesWithCustomStyle.map(({ key }) => key);
        }
        if (flags.withObserveEvents) {
            responsesWithObserveEvents = await BotResponses.find(
                {
                    $or: [
                        { 'metadata.pageChangeCallbacks': { $exists: true, $ne: null } },
                        { 'metadata.pageEventCallbacks': { $exists: true, $ne: null } },
                    ],
                    projectId,
                },
            ).lean();
            responsesWithObserveEvents = responsesWithObserveEvents.map(({ key }) => key);
        }
    }
    const responseKeys = matchedResponses.map(({ key }) => key);
    const fullSearch = combineSearches(escapedSearch, responseKeys, intents);
    const storiesFilter = {
        projectId,
        $or: [{ 'textIndex.info': { $regex: escapedSearch, $options: 'i' } }, { 'textIndex.contents': { $regex: fullSearch, $options: 'i' } }],
    };
    if (flags.withHighlights || flags.withCustomStyle || flags.withObserveEvents) {
        if (![...responsesWithObserveEvents, ...responsesWithCustomStyle, ...responsesWithHighlights].length) return [];
        storiesFilter.$and = [
            { 'textIndex.contents': { $regex: responsesWithHighlights.join('|') } },
            { 'textIndex.contents': { $regex: responsesWithCustomStyle.join('|') } },
            { 'textIndex.contents': { $regex: responsesWithObserveEvents.join('|') } },
            { 'textIndex.contents': { $regex: responseKeys.join('|') } },
        ];
    }
    if (flags.withTriggers) {
        storiesFilter.rules = { $exists: true, $ne: [] };
    }
    if (flags.publishedStories || flags.unpublishedStories) {
        storiesFilter.status = flags.publishedStories ? 'published' : 'unpublished';
    }
    const matched = Stories.find(
        storiesFilter,
        {
            fields: {
                _id: 1, title: 1, storyGroupId: 1,
            },
        },
    ).fetch();
    return matched;
};

const replaceLine = (story, lineToReplace, newLine) => {
    // regexp: [ ] = space; + = any number of the characters in the []; $ = end of string
    const regex = new RegExp(`- *${escape(lineToReplace)}([ ]+\n|\n|[ ]+$|$)`, 'g');
    return story.replace(regex, `- ${newLine}\n`);
};

const traverseReplaceLine = (story, lineToReplace, newLine) => {
    const updatedStory = story;
    if (story.story) {
        updatedStory.story = replaceLine(updatedStory.story, lineToReplace, newLine);
    }
    (updatedStory.branches || []).forEach((branch) => {
        traverseReplaceLine(branch, lineToReplace, newLine);
    });
    return updatedStory;
};

export const replaceStoryLines = (projectId, lineToReplace, newLine) => {
    const matchingStories = Stories.find(
        {
            projectId,
            $or: [{ 'textIndex.contents': { $regex: escape(lineToReplace) } }],

        },
        { fields: { _id: 1 } },
    ).fetch();
    return Promise.all(matchingStories.map(({ _id }) => {
        const story = Stories.findOne({ _id });
        const { _id: excludeId, ...rest } = traverseReplaceLine(story, lineToReplace, newLine);
        return Stories.update({ _id }, { $set: { ...rest, ...indexStory(rest, { includeEventsField: true }) } });
    }));
};

export const getTriggerIntents = async (projectId, options = {}) => {
    const { includeFields, key = 'triggerIntent' } = options;
    const stories = await Stories.find(
        {
            projectId,
            $and: [
                { rules: { $exists: true } },
                { rules: { $ne: [] } },
            ],
        },
        { fields: { triggerIntent: 1, ...(includeFields || {}) } },
    ).fetch();
    if (includeFields) {
        return stories.reduce((acc, { [key]: keyValue, ...rest }) => {
            acc[keyValue] = rest;
            return acc;
        }, {});
    }
    return stories.map(story => story[key]);
};
