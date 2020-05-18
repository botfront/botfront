import { check, Match } from 'meteor/check';
import uuidv4 from 'uuid/v4';
import shortid from 'shortid';
import {
    uniq, uniqBy, sortBy, intersectionBy, get,
} from 'lodash';
import {
    formatError, getModelIdsFromProjectId, getProjectIdFromModelId, auditLogIfOnServer,
} from '../../lib/utils';
import ExampleUtils from '../../ui/components/utils/ExampleUtils';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';
import { NLUModels } from './nlu_model.collection';
import {
    checkNoEmojisInExamples,
    renameIntentsInTemplates,
    getNluModelLanguages,
    canonicalizeExamples,
} from './nlu_model.utils';
import { Projects } from '../project/project.collection';
import { checkIfCan } from '../../lib/scopes';

const getModelWithTrainingData = (projectId, language) => {
    const modelIds = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } }).nlu_models;
    const model = modelIds && NLUModels.findOne({ _id: { $in: modelIds }, language }, { fields: { training_data: 1 } });
    return model;
};

const gazetteDefaults = {
    mode: 'ratio', minScoreDefault: 80,
};

Meteor.methods({
    async 'nlu.insertExamplesWithLanguage'(projectId, language, items) {
        checkIfCan(['nlu-data:w', 'stories:w'], projectId);
        check(projectId, String);
        check(language, String);
        check(items, Array);
        try {
            const modelIds = getModelIdsFromProjectId(projectId);
            const modelId = NLUModels.findOne(
                { _id: { $in: modelIds }, language },
                { fields: { _id: 1 } },
            )._id;
            auditLogIfOnServer('Inserted Example in language', {
                user: Meteor.user(),
                projectId,
                resId: modelId,
                type: 'updated',
                operation: 'nlu-data-updated',
                after: { items },
                resType: 'nlu-data',
            });
            return await Meteor.callWithPromise('nlu.insertExamples', modelId, items);
        } catch (e) {
            throw formatError(e);
        }
    },
    async 'nlu.saveExampleChanges'(modelId, examples) {
        checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
        check(modelId, String);
        check(examples, Array);
        
        const edited = [];
        const newExamples = [];
        const canonicalEdited = [];
        const deleted = [];

        examples.forEach((example) => {
            if (example.deleted) {
                deleted.push(example._id);
                return;
            }
            if (example.isNew) newExamples.push(example);
            if (example.edited) edited.push(example);
            if (example.canonicalEdited) {
                /*
                    the nlu.switchCanonical method toggles the
                    canonical state of the example. to set the canonical
                    value to the current value we nee to toggle it before
                    calling the nlu.switchCanonical method
                */
                canonicalEdited.push({ ...example, canonical: !example.canonical });
            }
        });
        
        await NLUModels.update({ _id: modelId }, { $pull: { 'training_data.common_examples': { _id: { $in: deleted } } } });
        await Meteor.callWithPromise('nlu.insertExamples', modelId, newExamples, { autoAssignCanonical: canonicalEdited.length === 0 });
        await Meteor.callWithPromise('nlu.updateManyExamples', modelId, edited);
        canonicalEdited.forEach(example => Meteor.call('nlu.switchCanonical', modelId, example));
    },

    async 'nlu.insertExamples'(modelId, items, options = {}) {
        checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
        check(modelId, String);
        check(items, Array);
        check(options, Object);
        const { autoAssignCanonical = true } = options;

        if (items.length === 0) {
            return 0;
        }
        checkNoEmojisInExamples(JSON.stringify(items));

        try {
            const normalizedItems = uniqBy(items.map(ExampleUtils.prepareExample).filter(({ intent }) => intent), 'text');
            const canonicalizedItems = autoAssignCanonical ? await canonicalizeExamples(normalizedItems, modelId) : normalizedItems;
            const model = NLUModels.findOne({ _id: modelId }, { fields: { 'training_data.common_examples': 1 } });
            const examples = model && model.training_data && model.training_data.common_examples.map(e => ExampleUtils.stripBare(e));
            const pullItemsText = intersectionBy(examples, canonicalizedItems, 'text').map(({ text }) => text);
            NLUModels.update({ _id: modelId }, { $pull: { 'training_data.common_examples': { text: { $in: pullItemsText } } } });
            auditLogIfOnServer('Inserted Example', {
                user: Meteor.user(),
                resId: modelId,
                projectId: getProjectIdFromModelId(modelId),
                type: 'updated',
                operation: 'nlu-data-updated',
                after: { items },
                resType: 'nlu-data',
            });
            return NLUModels.update({ _id: modelId }, { $push: { 'training_data.common_examples': { $each: canonicalizedItems, $position: 0 } } });
        } catch (e) {
            throw formatError(e);
        }
    },

    'nlu.updateExample'(modelId, item) {
        checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
        check(modelId, String);
        check(item, Object);

        const cleanItem = ExampleUtils.stripBare(item);
        try {
            if (!cleanItem.intent) throw new Error('Intent must be defined.');
            const exampleBefore = NLUModels.findOne({ _id: modelId, 'training_data.common_examples._id': cleanItem._id }, { fields: { 'training_data.common_examples.$': 1 } });
            const properExample = get(exampleBefore, 'training_data.common_examples[0]');
            auditLogIfOnServer('Updated Example', {
                user: Meteor.user(),
                resId: modelId,
                projectId: getProjectIdFromModelId(modelId),
                type: 'updated',
                operation: 'nlu-data-updated',
                before: { example: properExample },
                after: { example: item },
                resType: 'nlu-data',
            });
            return NLUModels.update({ _id: modelId, 'training_data.common_examples._id': cleanItem._id }, { $set: { 'training_data.common_examples.$': cleanItem } });
        } catch (e) {
            throw formatError(e);
        }
    },
    async 'nlu.updateManyExamples'(modelId, items) {
        checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
        check(modelId, String);
        check(items, Array);
        const updatedExamples = uniqBy(items, 'text').filter(({ intent }) => intent);
        if (items.length === 0) {
            return 0;
        }

        const model = NLUModels.findOne({ _id: modelId }, { fields: { 'training_data.common_examples': 1 } });
        const examples = model && model.training_data && model.training_data.common_examples.map(e => ExampleUtils.stripBare(e));
        const pullItems = intersectionBy(examples, updatedExamples, 'text').map(({ text }) => text);
        await NLUModels.update({ _id: modelId }, { $pull: { 'training_data.common_examples': { text: { $in: pullItems } } } });
        await NLUModels.update({ _id: modelId }, { $pull: { 'training_data.common_examples': { _id: { $in: updatedExamples.map(({ _id }) => _id) } } } });
        return NLUModels.update({ _id: modelId }, { $push: { 'training_data.common_examples': { $each: updatedExamples, $position: 0 } } });
    },

    async 'nlu.switchCanonical'(modelId, item) {
        checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
        check(modelId, String);
        check(item, Object);
        if (!item.intent) return { change: null };
        if (!item.canonical) {
            /* try to match a canonical item with the same characteristics (intent, entity, entity value)
            to check if the selected item can be used as canonical
            */
            const entities = item.entities ? item.entities : [];
            let elemMatch = {
                canonical: true, intent: item.intent, entities: { $size: entities.length },
            };

            if (entities.length > 0) {
                const entityElemMatchs = entities.map(entity => (
                    {
                        $elemMatch: { entity: entity.entity, value: entity.value },
                    }));
                elemMatch = {
                    ...elemMatch,
                    $and: [{ entities: { $size: entities.length } }, { entities: { $all: entityElemMatchs } }],
                };
                delete elemMatch.entities; // remove the entities field as the size condition is now in the $and
            }

            const query = {
                _id: modelId,
                'training_data.common_examples': {
                    $elemMatch: elemMatch,
                },
            };

            const results = NLUModels.findOne(query, { fields: { 'training_data.common_examples.$': 1 } });

            if (results !== undefined) {
                await Meteor.callWithPromise('nlu.updateExample', modelId, { ...results.training_data.common_examples[0], canonical: false });
            }
            auditLogIfOnServer('Marked example as canonical', {
                user: Meteor.user(),
                projectId: getProjectIdFromModelId(modelId),
                resId: modelId,
                type: 'updated',
                operation: 'nlu-data-updated',
                before: { example: item },
                after: { example: { ...item, canonical: true } },
                resType: 'nlu-data',
            });
            await Meteor.callWithPromise('nlu.updateExample', modelId, { ...item, canonical: true });
            
            return { change: results !== undefined };
        }
        await Meteor.callWithPromise('nlu.updateExample', modelId, { ...item, canonical: false });
        auditLogIfOnServer('Marked example as canonical', {
            user: Meteor.user(),
            projectId: getProjectIdFromModelId(modelId),
            resId: modelId,
            type: 'updated',
            operation: 'nlu-data-updated',
            before: { example: item },
            after: { example: { ...item, canonical: false } },
            resType: 'nlu-data',
        });
        return { change: false };
    },

    'nlu.deleteExample'(modelId, itemId) {
        checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
        check(modelId, String);
        check(itemId, String);
        const exampleBefore = NLUModels.findOne({ _id: modelId, 'training_data.common_examples._id': itemId }, { fields: { 'training_data.common_examples.$': 1 } });
        const properExample = get(exampleBefore, 'training_data.common_examples[0]');
        
        auditLogIfOnServer('Deleted nlu example ', {
            user: Meteor.user(),
            resId: modelId,
            projectId: getProjectIdFromModelId(modelId),
            type: 'deleted',
            operation: 'nlu-data-deleted',
            before: { example: properExample },
            resType: 'nlu-data',
        });
        return NLUModels.update({ _id: modelId }, { $pull: { 'training_data.common_examples': { _id: itemId } } });
    },

    'nlu.upsertEntitySynonym'(modelId, item) {
        checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
        check(modelId, String);
        check(item, Object);
        
        if (item._id) {
            const synonymBefore = NLUModels.findOne({ _id: modelId, 'training_data.entity_synonyms._id': item._id }, { fields: { 'training_data.entity_synonyms.$': 1 } });
            const properSynonym = get(synonymBefore, 'training_data.entity_synonyms[0]');
            auditLogIfOnServer('Updated entity synonym ', {
                user: Meteor.user(),
                resId: item._id,
                projectId: getProjectIdFromModelId(modelId),
                type: 'updated',
                operation: 'nlu-data-updated',
                before: { entitySynonym: properSynonym },
                after: { entitySynonym: item },
                resType: 'nlu-data',
            });
            return NLUModels.update({ _id: modelId, 'training_data.entity_synonyms._id': item._id }, { $set: { 'training_data.entity_synonyms.$': item } });
        }

        const newId = uuidv4();
        auditLogIfOnServer('Created entity synonym', {
            user: Meteor.user(),
            resId: newId,
            projectId: getProjectIdFromModelId(modelId),
            type: 'created',
            operation: 'nlu-data-created',
            after: { entitySynonym: item },
            resType: 'nlu-data',
        });
        return NLUModels.update({ _id: modelId }, { $push: { 'training_data.entity_synonyms': { _id: newId, ...item } } });
    },

    'nlu.deleteEntitySynonym'(modelId, itemId) {
        checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
        check(modelId, String);
        check(itemId, String);
        const synonymBefore = NLUModels.findOne({ _id: modelId, 'training_data.entity_synonyms._id': itemId }, { fields: { 'training_data.entity_synonyms.$': 1 } });
        const properSynonym = get(synonymBefore, 'training_data.entity_synonyms[0]');
        auditLogIfOnServer('Deleted entity synonym', {
            user: Meteor.user(),
            resId: itemId,
            projectId: getProjectIdFromModelId(modelId),
            type: 'deleted',
            operation: 'nlu-data-deleted',
            before: { entitySynonym: properSynonym },
            resType: 'nlu-data',
        });
        return NLUModels.update({ _id: modelId }, { $pull: { 'training_data.entity_synonyms': { _id: itemId } } });
    },

    'nlu.upsertEntityGazette'(modelId, item) {
        checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
        check(modelId, String);
        check(item, Object);

        if (item._id) {
            const gazetteBefore = NLUModels.findOne({ _id: modelId, 'training_data.fuzzy_gazette._id': item._id }, { fields: { 'training_data.fuzzy_gazette.$': 1 } });
            const properGazette = get(gazetteBefore, 'training_data.fuzzy_gazette[0]');
            auditLogIfOnServer('Updated entity gazette', {
                user: Meteor.user(),
                resId: modelId,
                projectId: getProjectIdFromModelId(modelId),
                type: 'updated',
                operation: 'nlu-data-created',
                before: { gazette: properGazette },
                after: { gazette: item },
                resType: 'nlu-data',
            });
    
            return NLUModels.update({ _id: modelId, 'training_data.fuzzy_gazette._id': item._id }, { $set: { 'training_data.fuzzy_gazette.$': item } });
        }
       

        const gazette = { _id: uuidv4(), ...gazetteDefaults, ...item };
        auditLogIfOnServer('Created entity gazette', {
            user: Meteor.user(),
            resId: gazette._id,
            projectId: getProjectIdFromModelId(modelId),
            type: 'created',
            operation: 'nlu-data-created',
            after: { gazette },
            resType: 'nlu-data',
        });
        return NLUModels.update({ _id: modelId }, { $push: { 'training_data.fuzzy_gazette': gazette } });
    },

    'nlu.deleteEntityGazette'(modelId, itemId) {
        checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
        check(modelId, String);
        check(itemId, String);
        const gazetteBefore = NLUModels.findOne({ _id: modelId, 'training_data.fuzzy_gazette._id': itemId }, { fields: { 'training_data.fuzzy_gazette.$': 1 } });
        const properGazette = get(gazetteBefore, 'training_data.fuzzy_gazette[0]');
        auditLogIfOnServer('Deleted entity gazette', {
            user: Meteor.user(),
            resId: modelId,
            projectId: getProjectIdFromModelId(modelId),
            type: 'deleted',
            operation: 'nlu-data-deleted',
            before: { gazette: properGazette },
            resType: 'nlu-data',
        });
        return NLUModels.update({ _id: modelId }, { $pull: { 'training_data.fuzzy_gazette': { _id: itemId } } });
    },
});

if (Meteor.isServer) {
    import { auditLog } from '../../../server/logger';

    const getChitChatProjectid = () => {
        // no permission needed
        const { settings: { public: { chitChatProjectId = null } = {} } = {} } = GlobalSettings.findOne({}, { fields: { 'settings.public.chitChatProjectId': 1 } });
        return chitChatProjectId;
    };

    const filterExistent = (current, toImport, identifier, defaultsToInsert) => {
        // identifier is a selected key to determine sameness, for example nlu example 'text'
        const toFilter = {};
        current.forEach((item) => { toFilter[item[identifier]] = true; }); // keep hashmap of existing items by chosen identifier
        const addToKeys = (input, curr) => { toFilter[curr[identifier]] = true; return input; };
        return toImport
            .reduce((acc, curr) => (
                curr[identifier] in toFilter // if item with same identifier exists
                    ? acc // pass
                    : addToKeys([...acc, { ...curr, ...defaultsToInsert, _id: uuidv4() }], curr) // else add example, giving it new id, and add to hashmap
            ), []);
    };

    Meteor.methods({
        'nlu.insert'(item, projectId) {
            checkIfCan('nlu-data:w', projectId);
            check(item, Object);
            check(projectId, String);
            
            // Check if the model with the langauge already exists in project
            // eslint-disable-next-line no-param-reassign
            const { nlu_models: nluModels } = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } });
            const nluModelLanguages = getNluModelLanguages(nluModels, true);
            if (nluModelLanguages.some(lang => (lang.value === item.language))) {
                throw new Meteor.Error('409', `Model with langauge ${item.language} already exists`);
            }
            let { config } = item;
            if (!config) {
                const {
                    settings: {
                        public: { defaultNLUConfig },
                    },
                } = GlobalSettings.findOne({}, { fields: { 'settings.public.defaultNLUConfig': 1 } });
                config = defaultNLUConfig;
            }
            const defaultModel = { ...item, config };
            const modelId = NLUModels.insert(defaultModel);
            Projects.update({ _id: projectId }, { $addToSet: { nlu_models: modelId } });
            auditLog('Nlu inserted', {
                user: Meteor.user(),
                resId: modelId,
                projectId,
                type: 'created',
                operation: 'nlu-model-created',
                after: { item },
                resType: 'nlu-data',
            });
            return modelId;
        },

        'nlu.update'(modelId, item) {
            checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
            check(item, Object);
            check(modelId, String);
            const before = NLUModels.findOne({ _id: modelId }, {
                fields: {
                    evaluations: 0, intents: 0, chitchat_intents: 0, training_data: 0,
                },
            });
            auditLog('Nlu updated', {
                user: Meteor.user(),
                resId: modelId,
                projectId: getProjectIdFromModelId(modelId),
                type: 'updated',
                operation: 'nlu-model-updated',
                before: { nluModel: before },
                after: { nluModel: item },
                resType: 'nlu-data',
            });
            NLUModels.update({ _id: modelId }, { $set: item });
            return modelId;
        },

        'nlu.update.general'(modelId, item) {
            checkIfCan('nlu-data:x', getProjectIdFromModelId(modelId));
            check(item, Object);
            check(modelId, String);
            const newItem = {};
            newItem.config = item.config;
            newItem.name = item.name;
            newItem.language = item.language;
            newItem.logActivity = item.logActivity;
            newItem.instance = item.instance;
            newItem.description = item.description;
            const before = NLUModels.findOne({ _id: modelId }, {
                fields: {
                    evaluations: 0, intents: 0, chitchat_intents: 0, training_data: 0,
                },
            });
            auditLog('Nlu updated general', {
                user: Meteor.user(),
                projectId: getProjectIdFromModelId(modelId),
                resId: modelId,
                type: 'updated',
                operation: 'nlu-model-updateed',
                before: { nluModel: before },
                after: { nluModel: item },
                resType: 'nlu-data',
            });
            NLUModels.update({ _id: modelId }, { $set: newItem });
            return modelId;
        },

        'nlu.remove'(modelId, projectId) {
            checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
            check(modelId, String);
            check(projectId, String);
            // check the default language of project and the language of model
            const modelLanguage = NLUModels.findOne({ _id: modelId });
            const projectDefaultLanguage = Projects.findOne({ _id: projectId });
            const before = NLUModels.findOne({ _id: modelId }, {
                fields: {
                    evaluations: 0, intents: 0, chitchat_intents: 0, training_data: 0,
                },
            });
            if (modelLanguage.language !== projectDefaultLanguage.defaultLanguage) {
                try {
                    NLUModels.remove({ _id: modelId });
                    auditLog('Nlu removed model', {
                        user: Meteor.user(),
                        resId: modelId,
                        projectId: getProjectIdFromModelId(modelId),
                        type: 'deleted',
                        operation: 'nlu-model-deleted',
                        before: { NluModel: before },
                        resType: 'nlu-data',
                    });
                    return Projects.update({ _id: projectId }, { $pull: { nlu_models: modelId } });
                } catch (e) {
                    throw e;
                }
            }
           
            throw new Meteor.Error('409', 'The default language cannot be deleted');
        },

        'nlu.getChitChatIntents'(modelId, language) {
            // -pemission- should require chitchat projectId?
            checkIfCan('nlu-data:r', getProjectIdFromModelId(modelId));
            check(language, String);
            check(modelId, String);
            const chitChatProjectId = getChitChatProjectid();
            if (!chitChatProjectId) {
                throw ReferenceError('Chitchat project not set in global settings');
            }
            const model = getModelWithTrainingData(chitChatProjectId, language);

            return model ? sortBy(uniq(model.training_data.common_examples.map(e => e.intent))) : [];
        },

        'nlu.addChitChatToTrainingData'(modelId, language, intents) {
            checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
            check(modelId, String);
            check(language, String);
            check(intents, [String]);

            const chitChatProjectId = getChitChatProjectid();
            if (!chitChatProjectId) {
                throw ReferenceError('Chitchat project not set in global settings');
            }

            const model = getModelWithTrainingData(chitChatProjectId, language);
            // eslint-disable-next-line camelcase
            const { training_data: { common_examples = [] } = {} } = model || {};
            auditLog('Nlu moded added chitchat intents to training data', {
                user: Meteor.user(),
                projectId: getProjectIdFromModelId(modelId),
                resId: modelId,
                type: 'updated',
                operation: 'nlu-data-updated',
                after: { intents },
                resType: 'nlu-data',
            });
            Meteor.call('nlu.insertExamples', modelId, common_examples.filter(({ intent }) => intents.indexOf(intent) >= 0));
        },

        'nlu.updateChitChatIntents'(modelId, intents) {
            checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
            check(modelId, String);
            check(intents, Array);
            const chitchatBefore = NLUModels.findOne({ _id: modelId }, { fields: { chitchat_intents: 1 } });
            const properIntents = get(chitchatBefore, 'chitchat_intents');
            auditLog('Nlu model updated chitchat', {
                user: Meteor.user(),
                resId: modelId,
                type: 'updated',
                operation: 'nlu-data-updated',
                before: { intents: properIntents },
                after: { intents },
                resType: 'nlu-data',
            });
            return NLUModels.update({ _id: modelId }, { $set: { chitchat_intents: intents } });
        },

        'nlu.import'(nluData, projectId, language, overwrite, canonicalExamples = []) {
            checkIfCan('nlu-data:w', projectId);
            check(nluData, Object);
            check(projectId, String);
            check(language, String);
            check(overwrite, Boolean);
            check(canonicalExamples, Array);
            /*
                Right now, overwriting replaces training_data array, and non-overwrite
                adds items whose filterExistent<identifier> doesn't already exist. Behavior to update existing
                data is not implemented.
            */

            try {
                const currentModel = getModelWithTrainingData(projectId, language);
                let commonExamples; let entitySynonyms; let fuzzyGazette;

                if (nluData.common_examples && nluData.common_examples.length > 0) {
                    commonExamples = nluData.common_examples.map(e => ({
                        ...e,
                        _id: uuidv4(),
                        canonical: canonicalExamples.includes(e.text),
                    }));
                    commonExamples = {
                        'training_data.common_examples': overwrite
                            ? commonExamples
                            : { $each: filterExistent(currentModel.training_data.common_examples, commonExamples, 'text'), $position: 0 },
                    };
                }

                if (nluData.entity_synonyms && nluData.entity_synonyms.length > 0) {
                    entitySynonyms = nluData.entity_synonyms.map(e => ({ ...e, _id: uuidv4() }));
                    entitySynonyms = {
                        'training_data.entity_synonyms': overwrite
                            ? entitySynonyms
                            : { $each: filterExistent(currentModel.training_data.entity_synonyms, entitySynonyms, 'value'), $position: 0 },
                    };
                }

                let gazetteKey;
                if (nluData.fuzzy_gazette && nluData.fuzzy_gazette.length > 0) gazetteKey = 'fuzzy_gazette';
                if (nluData.gazette && nluData.gazette.length > 0) gazetteKey = 'gazette';

                if (gazetteKey) {
                    fuzzyGazette = nluData[gazetteKey].map(e => ({ ...e, _id: uuidv4() }));
                    fuzzyGazette = {
                        'training_data.fuzzy_gazette': overwrite
                            ? fuzzyGazette
                            : { $each: filterExistent(currentModel.training_data.fuzzy_gazette, fuzzyGazette, 'value', gazetteDefaults), $position: 0 },
                    };
                }

                const op = overwrite
                    ? { $set: { ...commonExamples, ...entitySynonyms, ...fuzzyGazette } }
                    : { $push: { ...commonExamples, ...entitySynonyms, ...fuzzyGazette } };
                const safeTrainingData = get(currentModel, 'training_data');
                auditLog('Nlu data imported', {
                    user: Meteor.user(),
                    resId: currentModel._id,
                    type: 'updated',
                    operation: 'nlu-data-updated',
                    projectId,
                    after: { nluData },
                    before: { nluData: safeTrainingData },
                    resType: 'nlu-data',
                });
                return NLUModels.update({ _id: currentModel._id }, op);
            } catch (e) {
                if (e instanceof Meteor.Error) throw e;
                throw new Meteor.Error(e);
            }
        },

        'nlu.renameIntent'(modelId, oldIntent, newIntent, renameBotResponses = false) {
            checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
            check(modelId, String);
            check(oldIntent, String);
            check(newIntent, String);
            check(renameBotResponses, Boolean);

            try {
                const rawCollection = NLUModels.rawCollection();
                const updateSync = Meteor.wrapAsync(rawCollection.update, rawCollection);
                updateSync({ _id: modelId },
                    { $set: { 'training_data.common_examples.$[elem].intent': newIntent } },
                    { arrayFilters: [{ 'elem.intent': oldIntent }], multi: true });

                if (renameBotResponses) {
                    const project = Projects.find({ nlu_models: modelId }).fetch();

                    const newTemplates = renameIntentsInTemplates(project[0].templates, oldIntent, newIntent);

                    Projects.update({ nlu_models: modelId }, { $set: { templates: newTemplates } });
                }
                auditLog('Nlu renamed intent', {
                    user: Meteor.user(),
                    resId: modelId,
                    projectId: getProjectIdFromModelId(modelId),
                    type: 'updated',
                    operation: 'nlu-data-updated',
                    before: { intent: oldIntent },
                    after: { intent: newIntent },
                    resType: 'nlu-data',
                });
                return true;
            } catch (e) {
                throw new Meteor.Error(e);
            }
        },

        'nlu.removeExamplesByIntent'(modelId, arg) {
            checkIfCan('nlu-data:w', getProjectIdFromModelId(modelId));
            check(modelId, String);
            check(arg, Match.OneOf(String, [String]));
            const intents = typeof arg === 'string' ? [arg] : arg;
            const examplesBefore = NLUModels.findOne({ _id: modelId, 'training_data.common_examples': { intent: { $in: intents } } }, { fields: { 'training_data.common_examples.$': 1 } });
            const properExamples = get(examplesBefore, 'training_data.common_examples');
            try {
                NLUModels.update({ _id: modelId }, { $pull: { 'training_data.common_examples': { intent: { $in: intents } } } });
            } catch (e) {
                throw formatError(e);
            }
            auditLog('Nlu data removed example by intent', {
                userId: Meteor.user(),
                resId: modelId,
                type: 'updated',
                operation: 'nlu-data-deleted',
                projectId: getProjectIdFromModelId(modelId),
                before: { examples: properExamples },
                resType: 'nlu-data',
            });
        },

        async 'nlu.getUtteranceFromPayload'(projectId, payload, lang = 'en') {
            checkIfCan('nlu-data:r', projectId);
            check(projectId, String);
            check(lang, String);
            check(payload, Object);
            if (!payload.intent) throw new Meteor.Error('400', 'Intent missing from payload');
            const { nlu_models: nluModelIds } = Projects.findOne(
                { _id: projectId },
                { fields: { nlu_models: 1 } },
            );
            
            const entitiesQuery = [];
            if (payload.entities && payload.entities.length) {
                entitiesQuery.push({
                    $match: {
                        'training_data.common_examples.entities': {
                            $size: payload.entities.length,
                        },
                    },
                });
                payload.entities.forEach((entity) => {
                    entitiesQuery.push({
                        $match: {
                            'training_data.common_examples.entities.entity':
                                entity && entity.entity,
                            'training_data.common_examples.entities.value':
                                entity && entity.value,
                        },
                    });
                });
            } else {
                entitiesQuery.push({
                    $match: { 'training_data.common_examples.entities': { $size: 0 } },
                });
            }

            const models = await NLUModels.aggregate([
                { $match: { language: lang, _id: { $in: nluModelIds } } },
                {
                    $project: {
                        'training_data.common_examples': {
                            $filter: {
                                input: '$training_data.common_examples',
                                as: 'training_data',
                                cond: { $eq: ['$$training_data.intent', payload.intent] },
                            },
                        },
                    },
                },
                { $unwind: '$training_data.common_examples' },
                ...entitiesQuery,
                { $sort: { 'training_data.common_examples.canonical': -1, 'training_data.common_examples.updatedAt': -1 } },
            ]).toArray();

            const model = models[0];

            if (
                !model
                || !model.training_data
                || !model.training_data.common_examples.text
            ) throw new Meteor.Error('400', 'No correponding utterance');
            const {
                text, intent, entities, _id,
            } = model.training_data.common_examples;
            return {
                text, intent, entities, _id,
            };
        },

        async 'nlu.chitChatSetup'() {
            checkIfCan('projects:w');
            try {
                const data = {
                    fr: JSON.parse(Assets.getText('nlu/nlu-chitchat-fr.json')),
                    en: JSON.parse(Assets.getText('nlu/nlu-chitchat-en.json')),
                };
                const projectId = await Meteor.callWithPromise('project.insert', {
                    name: 'Chitchat',
                    _id: `chitchat-${shortid.generate()}`,
                    namespace: 'bf-chitchat',
                    defaultLanguage: 'en',
                });

                // eslint-disable-next-line no-restricted-syntax
                for (const lang of Object.keys(data)) {
                    // eslint-disable-next-line no-await-in-loop
                    await Meteor.callWithPromise(
                        'nlu.insert',
                        {
                            name: `chitchat-${lang}`,
                            language: lang,
                        },
                        projectId,
                    );
                    // eslint-disable-next-line no-await-in-loop
                    await Meteor.callWithPromise('nlu.import', data[lang].rasa_nlu_data, projectId, lang, true);
                }

                GlobalSettings.update({ _id: 'SETTINGS' }, { $set: { 'settings.public.chitChatProjectId': projectId } });
            } catch (e) {
                throw formatError(e);
            }
        },
    });
}
