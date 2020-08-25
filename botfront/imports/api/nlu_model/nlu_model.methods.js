import { check } from 'meteor/check';
import uuidv4 from 'uuid/v4';
import shortid from 'shortid';
import {
    uniq, uniqBy, sortBy, intersectionBy,
} from 'lodash';
import {
    formatError, getProjectIdFromModelId,
} from '../../lib/utils';
import ExampleUtils from '../../ui/components/utils/ExampleUtils';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';
import { NLUModels } from './nlu_model.collection';
import {
    checkNoEmojisInExamples,
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
        check(options, Object);
        check(modelId, String);
        check(items, Array);
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
            return NLUModels.update({ _id: modelId }, { $push: { 'training_data.common_examples': { $each: canonicalizedItems, $position: 0 } } });
        } catch (e) {
            throw formatError(e);
        }
    },

    'nlu.updateExample'(modelId, item) {
        check(modelId, String);
        check(item, Object);

        const cleanItem = ExampleUtils.stripBare(item);
        try {
            if (!cleanItem.intent) throw new Error('Intent must be defined.');
            return NLUModels.update({ _id: modelId, 'training_data.common_examples._id': cleanItem._id }, { $set: { 'training_data.common_examples.$': cleanItem } });
        } catch (e) {
            throw formatError(e);
        }
    },
    async 'nlu.updateManyExamples'(modelId, items) {
        checkIfCan('nlu:w', getProjectIdFromModelId(modelId));
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
            await Meteor.callWithPromise('nlu.updateExample', modelId, { ...item, canonical: true });
            return { change: results !== undefined };
        }
        await Meteor.callWithPromise('nlu.updateExample', modelId, { ...item, canonical: false });
        return { change: false };
    },

    'nlu.deleteExample'(modelId, itemId) {
        check(modelId, String);
        check(itemId, String);

        return NLUModels.update({ _id: modelId }, { $pull: { 'training_data.common_examples': { _id: itemId } } });
    },

    'nlu.upsertEntitySynonym'(modelId, item) {
        check(modelId, String);
        check(item, Object);

        if (item._id) {
            return NLUModels.update({ _id: modelId, 'training_data.entity_synonyms._id': item._id }, { $set: { 'training_data.entity_synonyms.$': item } });
        }

        return NLUModels.update({ _id: modelId }, { $push: { 'training_data.entity_synonyms': { _id: uuidv4(), ...item } } });
    },

    'nlu.deleteEntitySynonym'(modelId, itemId) {
        check(modelId, String);
        check(itemId, String);

        return NLUModels.update({ _id: modelId }, { $pull: { 'training_data.entity_synonyms': { _id: itemId } } });
    },

    'nlu.upsertEntityGazette'(modelId, item) {
        check(modelId, String);
        check(item, Object);

        if (item._id) {
            return NLUModels.update({ _id: modelId, 'training_data.fuzzy_gazette._id': item._id }, { $set: { 'training_data.fuzzy_gazette.$': item } });
        }

        const gazette = { _id: uuidv4(), ...gazetteDefaults, ...item };

        return NLUModels.update({ _id: modelId }, { $push: { 'training_data.fuzzy_gazette': gazette } });
    },

    'nlu.deleteEntityGazette'(modelId, itemId) {
        check(modelId, String);
        check(itemId, String);

        return NLUModels.update({ _id: modelId }, { $pull: { 'training_data.fuzzy_gazette': { _id: itemId } } });
    },
});

if (Meteor.isServer) {
    const getChitChatProjectid = () => {
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
            return modelId;
        },

        'nlu.update'(modelId, item) {
            check(item, Object);
            check(modelId, String);

            NLUModels.update({ _id: modelId }, { $set: item });
            return modelId;
        },

        'nlu.update.general'(modelId, item) {
            check(item, Object);
            check(modelId, String);

            const newItem = {};
            newItem.config = item.config;
            newItem.name = item.name;
            newItem.language = item.language;
            newItem.logActivity = item.logActivity;
            newItem.instance = item.instance;
            newItem.description = item.description;

            NLUModels.update({ _id: modelId }, { $set: newItem });
            return modelId;
        },

        'nlu.remove'(modelId, projectId) {
            check(modelId, String);
            check(projectId, String);
            // check the default language of project and the language of model
            const modelLanguage = NLUModels.findOne({ _id: modelId });
            const projectDefaultLanguage = Projects.findOne({ _id: projectId });
            if (modelLanguage.language !== projectDefaultLanguage.defaultLanguage) {
                try {
                    NLUModels.remove({ _id: modelId });
                    return Projects.update({ _id: projectId }, { $pull: { nlu_models: modelId } });
                } catch (e) {
                    throw e;
                }
            }
            throw new Meteor.Error('409', 'The default language cannot be deleted');
        },

        'nlu.getChitChatIntents'(language) {
            check(language, String);
            const chitChatProjectId = getChitChatProjectid();
            if (!chitChatProjectId) {
                throw ReferenceError('Chitchat project not set in global settings');
            }
            const model = getModelWithTrainingData(chitChatProjectId, language);

            return model ? sortBy(uniq(model.training_data.common_examples.map(e => e.intent))) : [];
        },

        'nlu.addChitChatToTrainingData'(modelId, language, intents) {
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

            Meteor.call('nlu.insertExamples', modelId, common_examples.filter(({ intent }) => intents.indexOf(intent) >= 0));
        },

        'nlu.updateChitChatIntents'(modelId, intents) {
            check(modelId, String);
            check(intents, Array);

            return NLUModels.update({ _id: modelId }, { $set: { chitchat_intents: intents } });
        },

        'nlu.import'(nluData, projectId, language, overwrite, canonicalExamples = []) {
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
                return NLUModels.update({ _id: currentModel._id }, op);
            } catch (e) {
                if (e instanceof Meteor.Error) throw e;
                throw new Meteor.Error(e);
            }
        },

        async 'nlu.chitChatSetup'() {
            try {
                const data = {
                    fr: JSON.parse(Assets.getText('nlu/nlu-chitchat-fr.json')),
                    en: JSON.parse(Assets.getText('nlu/nlu-chitchat-en.json')),
                };
                const projectId = await Meteor.callWithPromise('project.insert', {
                    name: 'Chitchat',
                    _id: `chitchat-${shortid.generate()}`,
                    namespace: 'chitchat',
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
