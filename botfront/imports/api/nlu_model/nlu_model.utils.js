import { check } from 'meteor/check';
import emojiTree from 'emoji-tree';
import moment from 'moment';
import {
    uniqBy, differenceBy, sortBy, uniq,
} from 'lodash';
import { NLUModels } from './nlu_model.collection';
import { languages } from '../../lib/languages';

export const isTraining = (model) => {
    const {
        _id: modelId,
        training,
        training: {
            startTime,
            status,
        } = {},
    } = model;

    if (!training) {
        return false;
    }
    const statusOk = status === 'training' && moment().diff(moment(startTime), 'minutes') < 30;
    const timeStampOk = moment().diff(moment(startTime), 'minutes') < 30;
    if (statusOk && !timeStampOk) { // something went wrong and training timed out
        Meteor.call('nlu.markTrainingStopped', modelId, 'failure', 'training timed out');
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

export const getPureIntents = (commonExamples) => {
    const pureIntents = new Set();
    commonExamples.forEach((e) => {
        if ((!e.entities || e.entities.length === 0) && e.intent) {
            pureIntents.add(e.intent);
        } else {
            pureIntents.delete(e.intent);
        }
    });
    return [...pureIntents];
};

export const renameIntentsInTemplates = (templates, oldIntent, newIntent) => {
    const newTemplate = templates;
    templates.forEach((template, index) => {
        // We rely on short circuit evaluation to prevent it from evaluating the 2nd expression
        // Thus this will not crash if template.match doesn't exist
        if (template.match && Array.isArray(template.match.nlu)) {
            template.match.nlu.forEach((match, matchIndex) => {
                if (match.intent === oldIntent) {
                    newTemplate[index].match.nlu[matchIndex].intent = newIntent;
                }
            });
        }
    });
    return newTemplate;
};
