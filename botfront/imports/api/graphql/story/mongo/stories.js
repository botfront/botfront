import { Stories } from '../../../story/stories.collection';
import BotResponses from '../../botResponses/botResponses.model';
import { indexStory } from '../../../story/stories.index';
import { searchForms } from '../../forms/mongo/forms';
import Examples from '../../examples/examples.model.js';

export const combineSearches = (search, ...rest) => {
    const searchRegex = [search];
    rest.forEach((searchArray) => {
        if (Array.isArray(searchArray) && searchArray.length) {
            searchRegex.push(searchArray.join('|'));
        }
    });
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
    const stringToRemove = [
        'with:triggers',
        'with:highlights',
        'with:custom_style',
        'status:unpublished',
        'status:published',
        'with:observe_events',
    ];
    const cleanedSearch = search
        .replace(new RegExp(stringToRemove.join('|'), 'g'), '')
        .trim();
    const escapedSearch = escape(cleanedSearch);
    const searchRegex = new RegExp(escapedSearch, 'i');
    const modelExamples = await Examples.find({
        projectId,
        'metadata.language': language,
    }).lean();
    const intents = modelExamples.reduce((filtered, option) => {
        if (searchRegex.test(option.text)) {
            return [...filtered, option.intent];
        }
        return filtered;
    }, []);
    const matchedResponses = await BotResponses.find({
        textIndex: { $regex: escapedSearch, $options: 'i' },
        projectId,
    }).lean();
    let responsesWithHighlights = [];
    let responsesWithCustomStyle = [];
    let responsesWithObserveEvents = [];
    if (flags.withHighlights) {
        responsesWithHighlights = await BotResponses.find({
            'metadata.domHighlight': { $exists: true, $ne: null },
            projectId,
        }).lean();
        responsesWithHighlights = responsesWithHighlights.map(({ key }) => key);
    }
    if (flags.withCustomStyle) {
        responsesWithCustomStyle = await BotResponses.find({
            'metadata.customCss': { $exists: true, $ne: null },
            projectId,
        }).lean();
        responsesWithCustomStyle = responsesWithCustomStyle.map(({ key }) => key);
    }
    if (flags.withObserveEvents) {
        responsesWithObserveEvents = await BotResponses.find({
            $or: [
                { 'metadata.pageChangeCallbacks': { $exists: true, $ne: null } },
                { 'metadata.pageEventCallbacks': { $exists: true, $ne: null } },
            ],
            projectId,
        }).lean();
        responsesWithObserveEvents = responsesWithObserveEvents.map(({ key }) => key);
    }
    const responseKeys = matchedResponses.map(({ key }) => key);
    const fullSearch = combineSearches(escapedSearch, responseKeys, intents);
    const storiesFilter = {
        projectId,
        $or: [
            { title: { $regex: fullSearch, $options: 'i' } },
            { textIndex: { $regex: fullSearch, $options: 'i' } },
        ],
    };
    if (
        [
            ...responsesWithObserveEvents,
            ...responsesWithCustomStyle,
            ...responsesWithHighlights,
        ].length
    ) {
        storiesFilter.$and = [
            { textIndex: { $regex: responsesWithHighlights.join('|') } },
            { textIndex: { $regex: responsesWithCustomStyle.join('|') } },
            { textIndex: { $regex: responsesWithObserveEvents.join('|') } },
            { textIndex: { $regex: responseKeys.join('|') } },
        ];
    } else if (flags.withHighlights || flags.withCustomStyle || flags.withObserveEvents) {
        storiesFilter.$and = [{ textIndex: 0 }];
    }
    if (flags.withTriggers) {
        storiesFilter.rules = { $exists: true, $ne: [] };
    }
    if (flags.publishedStories || flags.unpublishedStories) {
        storiesFilter.status = flags.publishedStories ? 'published' : 'unpublished';
    }
    const matched = Stories.find(storiesFilter, {
        fields: {
            _id: 1,
            title: 1,
            storyGroupId: 1,
            type: 1,
        },
    }).fetch();
    let matchedForms = [];
    // only search for forms if we have no smart triggers
    if (!Object.keys(flags).some(flagKey => flags[flagKey])) {
        matchedForms = await searchForms(projectId, search, responseKeys);
    }
    return { dialogueFragments: matched, forms: matchedForms };
};

const traverseReplaceLine = (story, lineToReplace, newLine) => {
    const updatedStory = story;
    (story.steps || []).forEach(({ action }, i) => {
        if (action === lineToReplace) updatedStory.steps[i].action = newLine;
    });
    (updatedStory.branches || []).forEach(branch => traverseReplaceLine(branch, lineToReplace, newLine));
    return updatedStory;
};

export const replaceStoryLines = (projectId, lineToReplace, newLine) => {
    const matchingStories = Stories.find(
        {
            projectId,
            textIndex: { $regex: escape(lineToReplace) },
        },
        { fields: { _id: 1 } },
    ).fetch();
    return Promise.all(
        matchingStories.map(({ _id }) => {
            const story = Stories.findOne({ _id });
            const { _id: excludeId, ...rest } = traverseReplaceLine(
                story,
                lineToReplace,
                newLine,
            );
            return Stories.update({ _id }, { $set: { ...rest, ...indexStory(rest) } });
        }),
    );
};

export const updateTestResults = async (testResults) => {
    Meteor.call('stories.update', testResults);
};

export const getTriggerIntents = async (projectId, options = {}) => {
    const { includeFields, key = 'triggerIntent' } = options;
    const stories = await Stories.find(
        {
            projectId,
            $and: [{ rules: { $exists: true } }, { rules: { $ne: [] } }],
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
