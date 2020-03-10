import { safeLoad } from 'js-yaml';
import { Stories } from './stories.collection';
import BotResponses from '../graphql/botResponses/botResponses.model';
import { Projects } from '../project/project.collection';
import { NLUModels } from '../nlu_model/nlu_model.collection';
import { getStoryContent } from '../../lib/story.utils';

const createResponseIndex = async (responseNames) => {
    const botResponses = await BotResponses.find({ key: { $in: responseNames } }).lean();
    const responsesIndex = [];
    botResponses.forEach((botResponse) => {
        let responseText = '';
        responseText += `"${botResponse.key}"`;
        botResponse.values.forEach((value) => {
            value.sequence.forEach((sequence) => {
                responseText += `"${safeLoad(sequence.content).text.replace(/\n/, ' ')}"`;
            });
        });
        responsesIndex.push(responseText);
    });
    return responsesIndex.join('\n');
};

export const indexStory = (storyToIndex, options = {}) => {
    /* options is an object with optional properties:

        update: Object (optional), must have property _id
                the index will be created from the merged
                version of storyToIndex and the update

        includeEventsField: adds bot responses and actions
                field called events in the returned object
                used for populating the events field of the
                story DB document.
    */
    const { includeEventsField } = options;
    const story = typeof storyToIndex === 'string'
        ? Stories.findOne({ _id: storyToIndex })
        : storyToIndex;
    const {
        userUtterances = [], botResponses = [], actions = [], slots = [],
    } = getStoryContent(story, options);
    const storyContentIndex = [
        ...userUtterances.map(({ name }) => name),
        ...botResponses,
        ...actions,
        ...slots,
    ].join(' \n ');
    const result = {};
    result.textIndex = { contents: storyContentIndex, info: story.title };
    if (includeEventsField) {
        const events = Array.from(new Set([...botResponses, ...actions]));
        result.events = events;
    }
    return result;
};

export const searchStories = async (projectId, language, searchString) => {
    const project = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } });
    const nluModels = project.nlu_models;
    const searchRegex = new RegExp(searchString);
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
    const matched = Stories.find(
        { projectId, $text: { $search: `${searchString} ${intents.join(' ')}` } },
        { fields: { _id: 1, title: 1 } },
    ).fetch();
    return matched;
};
