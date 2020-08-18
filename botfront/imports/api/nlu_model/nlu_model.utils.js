import { check } from 'meteor/check';
import emojiTree from 'emoji-tree';
import moment from 'moment';
import {
    uniqBy, differenceBy, sortBy, uniq,
} from 'lodash';
import { safeDump } from 'js-yaml';
import { NLUModels } from './nlu_model.collection';
import { languages } from '../../lib/languages';
import { Projects } from '../project/project.collection';

export const isTraining = (project) => {
    const {
        _id: projectId,
        training,
        training: {
            startTime,
            instanceStatus,
        } = {},
    } = project;
    if (!training) {
        return false;
    }
    const statusOk = instanceStatus === 'training' && moment().diff(moment(startTime), 'minutes') < 30;
    const timeStampOk = moment().diff(moment(startTime), 'minutes') < 30;
    if (statusOk && !timeStampOk) { // something went wrong and training timed out
        Meteor.call('project.markTrainingStopped', projectId, 'failure', 'training timed out');
    }
    return !!statusOk && !!timeStampOk;
};


export const checkNoDuplicatesInExamples = (examples) => {
    const uniques = uniqBy(examples, 'text');
    const duplicates = differenceBy(examples, uniques, '_id');
    if (duplicates.length > 0) {
        const dups = uniqBy(duplicates, 'text').map(d => `"${d.text}"`).join(', ');
        throw new Meteor.Error('400', `Duplicates found: ${dups}`);
    }
};

export const checkNoEmojisInExamples = (examples) => {
    emojiTree(JSON.stringify(examples)).forEach((c) => {
        if (c.type === 'emoji') {
            throw new Meteor.Error('400', `Emojis not allowed: ${c.text}`);
        }
    });
};

export const getNluModelLanguages = (modelIds, asOptions = false) => {
    check(modelIds, Array);
    const models = NLUModels.find({ _id: { $in: modelIds } }, { fields: { language: 1 } }).fetch();
    const languageCodes = sortBy(uniq(models.map(m => m.language)));
    if (asOptions) return languageCodes.map(value => ({ text: languages[value].name, value }));
    return languageCodes;
};

export const getEntityCountDictionary = (entities) => {
    const entitiesCount = {}; // total occurances of each entity
    entities.forEach(({ entity }) => {
        entitiesCount[entity] = entitiesCount[entity] ? entitiesCount[entity] + 1 : 1;
    });
    return entitiesCount;
};

export const findExampleMatch = (example, item, itemEntities) => {
    if (item.intent !== example.intent) return false; // check examples have the same intent name
    if (item.entities.length !== example.entities.length) return false; // check examples have the same number of entities
    const exampleEntities = getEntityCountDictionary(example.entities);
    const entityMatches = Object
        .keys(itemEntities)
        .filter(key => exampleEntities[key] === itemEntities[key]);
    return entityMatches.length === Object.keys(itemEntities).length; // check examples have the same entities
};

export const canonicalizeExamples = async (items, modelId) => {
    const nluModel = await NLUModels.findOne({ _id: modelId }, { fields: { training_data: true } });
    let { training_data: { common_examples: commonExamples } } = nluModel || { training_data: {} };

    const canonicalizedItems = items.map((item) => {
        const itemEntities = getEntityCountDictionary(item.entities); // total occurances of each entity in this example
        const match = commonExamples.find(example => findExampleMatch(example, item, itemEntities));

        if (!match) {
            // prevent a multi-insert from creating multiple canonical examples for the same intent
            commonExamples = [...commonExamples, item];
        }
        return { ...item, canonical: !match }; // if theres is no matching example, the example is canonical
    });

    return canonicalizedItems;
};

export const nluExampleSorter = (a, b) => {
    if ((a.canonical || b.canonical) && a.canonical !== b.canonical) {
        return (b.canonical || false - a.canonical || false);
    }
    if (a.intent < b.intent) return -1;
    if (a.intent > b.intent) return 1;
    if (a.text < b.text) return -1;
    if (a.text > b.text) return 1;
    return 0;
};

export const nluSorterIgnoreCanonical = (a, b) => {
    if (a.intent < b.intent) return -1;
    if (a.intent > b.intent) return 1;
    if (a.text < b.text) return -1;
    if (a.text > b.text) return 1;
    return 0;
};

const convertNluToYaml = (examples, language) => {
    const sortedExamples = examples.sort(nluSorterIgnoreCanonical);
    // THIS REDUCE FUNCTION IS DEPENDANT ON THE NLU BEING SORTED BY nluSorterIgnoreCanonical!!!!!
    const nluData = sortedExamples.reduce((acc, current) => {
        const { intent, text, canonical } = current;
        if (acc.nlu[acc.currentIndex] && intent !== acc.nlu[acc.currentIndex].intent) {
            /*  Skip to the next element of the array when the intent changes.
                Examples for a single intent are all grouped as a result of the
                sort.
            */
            acc.currentIndex += 1;
        }
        if (!acc.nlu[acc.currentIndex]) acc.nlu[acc.currentIndex] = { intent, examples: [] };
        /* canonical examples have their own field so they are not lost
           when exported in rasa format */
        if (canonical) acc.canonical.push(text);
        acc.nlu[acc.currentIndex].examples.push(text);
        return acc;
    }, {
        nlu: [], lang: language, canonical: [], currentIndex: 0,
    });
    delete nluData.currentIndex;
    return safeDump(nluData);
};
export const generateNluYaml = (projectId, language) => {
    const { nlu_models: nluModels } = Projects.findOne({ _id: projectId });
    const models = NLUModels.find({
        _id: { $in: nluModels },
        ...(language === 'all' ? {} : { language }),
    }).fetch();
    return models.reduce((acc, model) => (
        {
            ...acc,
            [model.language]: {
                data: convertNluToYaml(
                    model.training_data.common_examples,
                    model.language,
                ),
            },
        }
    ), {});
};
