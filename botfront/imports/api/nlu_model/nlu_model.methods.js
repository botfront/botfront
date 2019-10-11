import { check, Match } from 'meteor/check';
import uuidv4 from 'uuid/v4';
import shortid from 'shortid';
import {
    uniq, uniqBy, sortBy, intersectionBy, find,
} from 'lodash';
import { formatError, getProjectIdFromModelId, getModelIdsFromProjectId } from '../../lib/utils';
import ExampleUtils from '../../ui/components/utils/ExampleUtils';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';
import { NLUModels } from './nlu_model.collection';
import {
    checkNoEmojisInExamples,
    renameIntentsInTemplates,
    getNluModelLanguages,
} from './nlu_model.utils';
import { Projects } from '../project/project.collection';
import { checkIfCan } from '../../lib/scopes';

const getModelWithTrainingData = (chitChatProjectId, language) => {
    const modelIds = Projects.findOne({ _id: chitChatProjectId }, { fields: { nlu_models: 1 } }).nlu_models;
    const model = modelIds && NLUModels.findOne({ _id: { $in: modelIds }, language }, { fields: { 'training_data.common_examples': 1 } });
    return model;
};

const gazetteDefaults = {
    mode: 'ratio', minScoreDefault: 80,
};

Meteor.methods({
    async 'nlu.insertExamplesWithLanguage'(projectId, language, items) {
        check(projectId, String);
        check(language, String);
        check(items, Array);
        checkIfCan('nlu-admin', projectId);
        try {
            const modelIds = getModelIdsFromProjectId(projectId);
            const modelId = NLUModels.findOne(
                { _id: { $in: modelIds }, language },
                { fields: { _id: 1 } },
            )._id;
            return await Meteor.callWithPromise('nlu.insertExamples', modelId, items.map(ExampleUtils.prepareExample));
        } catch (e) {
            throw formatError(e);
        }
    },
    
    'nlu.insertExamples'(modelId, items) {
        check(modelId, String);
        check(items, Array);
        checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

        if (items.length === 0) {
            return 0;
        }
        checkNoEmojisInExamples(JSON.stringify(items));

        try {
            const normalizedItems = uniqBy(items, 'text');
            const model = NLUModels.findOne({ _id: modelId }, { fields: { 'training_data.common_examples': 1 } });
            const examples = model && model.training_data && model.training_data.common_examples.map(e => ExampleUtils.stripBare(e));
            const pullItemsText = intersectionBy(examples, normalizedItems, 'text').map(({ text }) => text);
            NLUModels.update({ _id: modelId }, { $pull: { 'training_data.common_examples': { text: { $in: pullItemsText } } } });
            return NLUModels.update({ _id: modelId }, { $push: { 'training_data.common_examples': { $each: normalizedItems, $position: 0 } } });
        } catch (e) {
            throw formatError(e);
        }
    },

    'nlu.updateExample'(modelId, item) {
        check(modelId, String);
        check(item, Object);
        checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

        const cleanItem = ExampleUtils.stripBare(item);
        try {
            return NLUModels.update({ _id: modelId, 'training_data.common_examples._id': cleanItem._id }, { $set: { 'training_data.common_examples.$': cleanItem } });
        } catch (e) {
            throw formatError(e);
        }
    },

    'nlu.deleteExample'(modelId, itemId) {
        check(modelId, String);
        check(itemId, String);
        checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

        return NLUModels.update({ _id: modelId }, { $pull: { 'training_data.common_examples': { _id: itemId } } });
    },

    'nlu.upsertEntitySynonym'(modelId, item) {
        check(modelId, String);
        check(item, Object);
        checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

        if (item._id) {
            return NLUModels.update({ _id: modelId, 'training_data.entity_synonyms._id': item._id }, { $set: { 'training_data.entity_synonyms.$': item } });
        }

        return NLUModels.update({ _id: modelId }, { $push: { 'training_data.entity_synonyms': { _id: uuidv4(), ...item } } });
    },

    'nlu.deleteEntitySynonym'(modelId, itemId) {
        check(modelId, String);
        check(itemId, String);
        checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

        return NLUModels.update({ _id: modelId }, { $pull: { 'training_data.entity_synonyms': { _id: itemId } } });
    },

    'nlu.upsertEntityGazette'(modelId, item) {
        check(modelId, String);
        check(item, Object);
        checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

        if (item._id) {
            return NLUModels.update({ _id: modelId, 'training_data.fuzzy_gazette._id': item._id }, { $set: { 'training_data.fuzzy_gazette.$': item } });
        }

        const gazette = { _id: uuidv4(), ...gazetteDefaults, ...item };

        return NLUModels.update({ _id: modelId }, { $push: { 'training_data.fuzzy_gazette': gazette } });
    },

    'nlu.deleteEntityGazette'(modelId, itemId) {
        check(modelId, String);
        check(itemId, String);
        checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

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
            item.published = true; // a model should be published as soon as it is created
            const { nlu_models: nluModels } = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } });
            const nluModelLanguages = getNluModelLanguages(nluModels, true);
            if (nluModelLanguages.some(lang => (lang.value === item.language))) {
                throw new Meteor.Error('409', `Model with langauge ${item.language} already exists`);
            }
            const {
                settings: {
                    public: { defaultNLUConfig },
                },
            } = GlobalSettings.findOne({}, { fields: { 'settings.public.defaultNLUConfig': 1 } });
            const defaultModel = { ...item, config: defaultNLUConfig };
            const modelId = NLUModels.insert(defaultModel);
            Projects.update({ _id: projectId }, { $addToSet: { nlu_models: modelId } });
            return modelId;
        },

        'nlu.update'(modelId, item) {
            check(item, Object);
            check(modelId, String);
            checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

            NLUModels.update({ _id: modelId }, { $set: item });
            return modelId;
        },

        'nlu.remove'(modelId, projectId) {
            check(modelId, String);
            check(projectId, String);
            checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));
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

        'nlu.removelanguage'(projectId, language) {
            check(projectId, String);
            check(language, String);
            checkIfCan('nlu-admin', projectId);
            const modelIds = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } }).nlu_models;
            const { _id: modelId } = NLUModels.findOne({ _id: { $in: modelIds }, language });
            try {
                NLUModels.remove({ _id: modelId });
                return Projects.update({ _id: projectId }, { $pull: { nlu_models: modelId } });
            } catch (e) {
                throw e;
            }
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
            checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

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
            checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

            return NLUModels.update({ _id: modelId }, { $set: { chitchat_intents: intents } });
        },

        'nlu.import'(nluData, modelId, overwrite) {
            check(nluData, Object);
            check(modelId, String);
            check(overwrite, Boolean);
            checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));
            /*
                Right now, overwriting replaces training_data array, and non-overwrite
                adds items whose filterExistent<identifier> doesn't already exist. Behavior to update existing
                data is not implemented.
            */

            try {
                const currentModel = NLUModels.findOne({ _id: modelId }, { training_data: 1 });
                let commonExamples; let entitySynonyms; let fuzzyGazette;

                if (nluData.common_examples && nluData.common_examples.length > 0) {
                    commonExamples = nluData.common_examples.map(e => ({ ...e, _id: uuidv4() }));
                    commonExamples = {
                        'training_data.common_examples': overwrite
                            ? commonExamples
                            : { $each: filterExistent(currentModel.training_data.common_examples, commonExamples, 'text') },
                    };
                }

                if (nluData.entity_synonyms && nluData.entity_synonyms.length > 0) {
                    entitySynonyms = nluData.entity_synonyms.map(e => ({ ...e, _id: uuidv4() }));
                    entitySynonyms = {
                        'training_data.entity_synonyms': overwrite
                            ? entitySynonyms
                            : { $each: filterExistent(currentModel.training_data.entity_synonyms, entitySynonyms, 'value') },
                    };
                }

                if (nluData.fuzzy_gazette && nluData.fuzzy_gazette.length > 0) {
                    fuzzyGazette = nluData.fuzzy_gazette.map(e => ({ ...e, _id: uuidv4() }));
                    fuzzyGazette = {
                        'training_data.fuzzy_gazette': overwrite
                            ? fuzzyGazette
                            : { $each: filterExistent(currentModel.training_data.fuzzy_gazette, fuzzyGazette, 'value', gazetteDefaults) },
                    };
                }

                const op = overwrite
                    ? { $set: { ...commonExamples, ...entitySynonyms, ...fuzzyGazette } }
                    : { $push: { ...commonExamples, ...entitySynonyms, ...fuzzyGazette } };
                return NLUModels.update({ _id: modelId }, op);
            } catch (e) {
                if (e instanceof Meteor.Error) throw e;
                throw new Meteor.Error(e);
            }
        },

        'nlu.renameIntent'(modelId, oldIntent, newIntent, renameBotResponses = false) {
            check(modelId, String);
            check(oldIntent, String);
            check(newIntent, String);
            check(renameBotResponses, Boolean);
            checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

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

                return true;
            } catch (e) {
                throw new Meteor.Error(e);
            }
        },

        'nlu.removeExamplesByIntent'(modelId, arg) {
            check(modelId, String);
            check(arg, Match.OneOf(String, [String]));
            const intents = typeof arg === 'string' ? [arg] : arg;

            try {
                NLUModels.update({ _id: modelId }, { $pull: { 'training_data.common_examples': { intent: { $in: intents } } } });
            } catch (e) {
                throw formatError(e);
            }
        },

        'nlu.publish'(modelId, projectId) {
            check(modelId, String);
            check(projectId, String);
            checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));
            try {
                const project = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } });
                const models = NLUModels.find({ _id: { $in: project.nlu_models } }, { fields: { published: 1, language: 1, name: 1 } }).fetch();
                const modelToPublish = find(models, { _id: modelId });
                if (!modelToPublish) throw new Meteor.Error('404', 'Model not found!');
                const currentModel = find(models, { language: modelToPublish.language, published: true });
                if (!currentModel || currentModel._id !== modelToPublish._id) {
                    if (currentModel) {
                        NLUModels.update({ _id: currentModel._id }, { $set: { published: false } });
                    }
                    return NLUModels.update({ _id: modelToPublish._id }, { $set: { published: true } });
                }
                return 0;
            } catch (e) {
                throw formatError(e);
            }
        },

        'nlu.getPublishedModelsLanguages'(projectId) {
            check(projectId, String);
            checkIfCan('nlu-admin', projectId);
            try {
                const project = Projects.findOne(
                    { _id: projectId },
                    {
                        fields: {
                            nlu_models: 1,
                            defaultLanguage: 1,
                        },
                    },
                );
                if (!project) throw new Meteor.Error('400', 'Bad Request');
                const models = NLUModels.find(
                    {
                        _id: { $in: project.nlu_models },
                        published: true,
                    },
                    { fields: { language: 1 } },
                ).fetch();
                return models;
            } catch (e) {
                throw formatError(e);
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
                    const modelId = await Meteor.callWithPromise(
                        'nlu.insert',
                        {
                            name: `chitchat-${lang}`,
                            language: lang,
                        },
                        projectId,
                    );
                    // eslint-disable-next-line no-await-in-loop
                    await Meteor.callWithPromise('nlu.import', data[lang].rasa_nlu_data, modelId, true);
                }

                GlobalSettings.update({ _id: 'SETTINGS' }, { $set: { 'settings.public.chitChatProjectId': projectId } });
            } catch (e) {
                throw formatError(e);
            }
        },
    });
}
