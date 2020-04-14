import { Stories } from '../../../story/stories.collection';
import { Projects } from '../../../project/project.collection';
import { NLUModels } from '../../../nlu_model/nlu_model.collection';
import BotResponses from '../../botResponses/botResponses.model';

const combineSearches = (search, responseKeys, intents) => {
    const searchRegex = [search];
    if (responseKeys.length) searchRegex.push(responseKeys.join('|'));
    if (intents.length) searchRegex.push(intents.join('|'));
    return searchRegex.join('|');
};

export const searchStories = async (projectId, language, search) => {
    const project = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } });
    const nluModels = project.nlu_models;
    const searchRegex = new RegExp(search, 'i');
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
        { textIndex: { $regex: search, $options: 'i' } },
    ).lean();
    const responseKeys = matchedResponses.map(({ key }) => key);
    const fullSearch = combineSearches(search, responseKeys, intents);
    const matched = Stories.find(
        {
            projectId,
            $or: [{ 'textIndex.info': { $regex: search, $options: 'i' } }, { 'textIndex.contents': { $regex: fullSearch, $options: 'i' } }],
        },
        {
            fields: {
                _id: 1, title: 1, storyGroupId: 1,
            },
        },
    ).fetch();
    return matched;
};
