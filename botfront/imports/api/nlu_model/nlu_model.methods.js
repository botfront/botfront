import { check, Match } from 'meteor/check';
import uuidv4 from 'uuid/v4';
import shortid from 'shortid';
import {
    uniq, uniqBy, sortBy, intersectionBy, find, uniqWith, isEqual,
} from 'lodash';
import { formatError, getProjectIdFromModelId } from '../../lib/utils';
import ExampleUtils from '../../ui/components/utils/ExampleUtils';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';
import { NLUModels } from './nlu_model.collection';
import { checkNoEmojisInExamples, checkNoDuplicatesInExamples, renameIntentsInTemplates, getNluModelLanguages } from './nlu_model.utils';
import { setGazetteDefaults } from '../../ui/components/synonyms/GazetteConfig';
import { Projects } from '../project/project.collection';
import { Instances } from '../instances/instances.collection';
import { checkIfCan } from '../../lib/scopes';

Meteor.methods({
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

        const gazette = { _id: uuidv4(), ...item };
        setGazetteDefaults(gazette);

        return NLUModels.update({ _id: modelId }, { $push: { 'training_data.fuzzy_gazette': gazette } });
    },

    'nlu.deleteEntityGazette'(modelId, itemId) {
        check(modelId, String);
        check(itemId, String);
        checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

        return NLUModels.update({ _id: modelId }, { $pull: { 'training_data.fuzzy_gazette': { _id: itemId } } });
    },

    'nlu.markTrainingStarted'(modelId) {
        check(modelId, String);
        checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

        try {
            return NLUModels.update({ _id: modelId }, { $set: { training: { status: 'training', startTime: new Date() } } });
        } catch (e) {
            throw e;
        }
    },

    'nlu.markTrainingStopped'(modelId, status, error) {
        check(modelId, String);
        check(status, String);
        check(error, Match.Optional(String));
        checkIfCan('nlu-admin', getProjectIdFromModelId(modelId));

        try {
            const set = { training: { status, endTime: new Date() } };
            if (error) {
                set.training.message = error;
            }
            return NLUModels.update({ _id: modelId }, { $set: set });
        } catch (e) {
            throw e;
        }
    },
});

if (Meteor.isServer) {
    const getChitChatProjectid = () => {
        const { settings: { public: { chitChatProjectId = null } = {} } = {} } = GlobalSettings.findOne({}, { fields: { 'settings.public.chitChatProjectId': 1 } });
        return chitChatProjectId;
    };

    Meteor.methods({
        'nlu.insert'(item, projectId) {
            check(item, Object);
            check(projectId, String);
            // Check if the model with the langauge already exists in project
            const project = Projects.findOne({ _id: projectId }, { fields: { nlu_models: 1 } });
            const nluModelLanguages = getNluModelLanguages(project.nlu_models, true);
            if (nluModelLanguages.map(lang => (lang.value)).includes(item.language)) {
                return `Model with langauge ${item.language} already exists`;
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
            const modelLanguage = NLUModels.findOne({ _id: modelId }, { fields: { languague: 1 } });
            const projectDefaultLanguage = Projects.findOne({ _id: projectId }, { fields: { defaultLanguage: 1 } });
            if (modelLanguage !== projectDefaultLanguage) {
                try {
                    NLUModels.remove({ _id: modelId });
                    Projects.update({ _id: projectId }, { $pull: { nlu_models: modelId } });
                } catch (e) {
                    throw e;
                }
            }
            return 'Model Deleted';
        },

        'nlu.getChitChatIntents'(language) {
            check(language, String);
            const chitChatProjectId = getChitChatProjectid();
            if (!chitChatProjectId) {
                throw ReferenceError('Chitchat project not set in global settings');
            }
            const modelIds = Projects.findOne({ _id: chitChatProjectId }, { fields: { nlu_models: 1 } }).nlu_models;
            const model = modelIds && NLUModels.findOne({ _id: { $in: modelIds }, language }, { fields: { 'training_data.common_examples': 1 } });

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

            const modelIds = Projects.findOne({ _id: chitChatProjectId }, { fields: { nlu_models: 1 } }).nlu_models;
            const model = modelIds && NLUModels.findOne({ _id: { $in: modelIds }, language }, { fields: { 'training_data.common_examples': 1 } });
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

            try {
                const command = overwrite ? '$set' : '$push';
                const ops = {};
                ops[command] = {};
                if (nluData.common_examples && nluData.common_examples.length > 0) {
                    // remove perfect duplicates before adding ids
                    nluData.common_examples = uniqWith(nluData.common_examples, isEqual).map(e => ExampleUtils.stripBare(e));
                    nluData.common_examples.forEach(e => (e._id = uuidv4()));
                    checkNoDuplicatesInExamples(nluData.common_examples);
                    checkNoEmojisInExamples(JSON.stringify(nluData.common_examples));
                    if (command === '$push') {
                        const normalizedItems = uniqBy(nluData.common_examples, 'text');
                        const pullItemsText = intersectionBy(nluData.common_examples, normalizedItems, 'text').map(({ text }) => text);
                        NLUModels.update({ _id: modelId }, { $pull: { 'training_data.common_examples': { text: { $in: pullItemsText } } } });
                    }
                    ops[command]['training_data.common_examples'] = overwrite ? nluData.common_examples : { $each: nluData.common_examples };
                }

                // TODO: fix bug with simple-schema hanging when there are empty strings
                if (nluData.entity_synonyms && nluData.entity_synonyms.length > 0) {
                    nluData.entity_synonyms.forEach((e) => {
                        // pre-process
                        e._id = uuidv4();
                        e.synonyms = e.synonyms.filter(s => s !== '');
                    });
                    ops[command]['training_data.entity_synonyms'] = overwrite ? nluData.entity_synonyms : { $each: nluData.entity_synonyms };
                }

                if (nluData.fuzzy_gazette && nluData.fuzzy_gazette.length > 0) {
                    nluData.fuzzy_gazette.forEach((e) => {
                        e._id = uuidv4();
                        e.gazette = e.gazette.filter(s => s !== '');
                        setGazetteDefaults(e);
                    });
                    ops[command]['training_data.fuzzy_gazette'] = overwrite ? nluData.fuzzy_gazette : { $each: nluData.fuzzy_gazette };
                }

                return NLUModels.update({ _id: modelId }, ops);
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
                const projectId = await Meteor.callWithPromise('project.insert', { name: 'Chitchat', _id: `chitchat-${shortid.generate()}`, namespace: 'chitchat' });
                
                const instance = Instances.findOne({ projectId });
            
                // eslint-disable-next-line no-restricted-syntax
                for (const lang of Object.keys(data)) {
                    // eslint-disable-next-line no-await-in-loop
                    const modelId = await Meteor.callWithPromise(
                        'nlu.insert',
                        {
                            name: `chitchat-${lang}`,
                            language: lang,
                            instance: instance ? instance._id : null,
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
