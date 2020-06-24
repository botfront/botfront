import { check } from 'meteor/check';
import emojiTree from 'emoji-tree';
import moment from 'moment';
import {
    uniqBy, differenceBy, sortBy, uniq,
} from 'lodash';
import { NLUModels } from './nlu_model.collection';
import { languages } from '../../lib/languages';

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
