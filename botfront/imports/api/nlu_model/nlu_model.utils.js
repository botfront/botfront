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
            status,
        } = {},
    } = project;
    if (!training) {
        return false;
    }
    const statusOk = status === 'training' && moment().diff(moment(startTime), 'minutes') < 30;
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

export const getPublishedNluModelLanguages = (modelIds, asOptions = false) => {
    check(modelIds, Array);
    const models = NLUModels.find({ _id: { $in: modelIds }, published: true }, { fields: { language: 1 } }).fetch();
    const languageCodes = sortBy(uniq(models.map(m => m.language)));
    if (asOptions) return languageCodes.map(value => ({ text: languages[value].name, value }));
    return languageCodes;
};

const smartTips = (flags) => {
    let code, message;
    const { intentBelowTh, entitiesBelowTh } = flags;
    if (intentBelowTh) {
        message = `Validate this utterance: Intent ${intentBelowTh.name} was predicted with confidence ${intentBelowTh.confidence}, which is below your set threshold.`;
        code = 'intentBelowTh';
    }
    if (entitiesBelowTh) {
        const plural = entitiesBelowTh.length > 1;
        const entityNames = entitiesBelowTh.map(entity => entity.name);
        const entityConf = entitiesBelowTh.map(entity => entity.confidence);
        message = `Validate this utterance: Entit${plural ? 'ies' : 'y'} ${entityNames.join(', ')} ${plural ? 'were' : 'was'} predicted
        with confidence ${entityConf.join(', ')}, which is below your set threshold.`;
        code = 'entitiesBelowTh';
    }

    return { code, message };
};

const isUtteranceOutdated = ({ training: { endTime } = {} }, { updatedAt }) => moment(updatedAt).isBefore(moment(endTime));

export const getOutdatedUtterances = (utterances, projectData) => utterances.filter(u => isUtteranceOutdated(projectData, u));


export const getSmartTips = (model, utterance, th) => {
    examples = model.training_data.common_examples;
    // synonyms = model.training_data.entity_synonyms;
    // gazette = model.training_data.gazette;
    if (isUtteranceOutdated(utterance)) return 'outdated';
    const intentBelowTh = utterance.confidence < th ? { name: utterance.intent, confidence: utterance.confidence } : null;
    if (intentBelowTh) return smartTips({ intentBelowTh });
    const entitiesBelowTh = utterance.entities.filter(entity => entity.confidence < th)
        .map(entity => ({ name: entity.entity, confidence: entity.confidence }));
    if (entitiesBelowTh.length) return smartTips({ entitiesBelowTh });
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
