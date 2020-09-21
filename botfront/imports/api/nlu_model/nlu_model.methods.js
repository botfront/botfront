import { check, Match } from 'meteor/check';
import uuidv4 from 'uuid/v4';
import shortid from 'shortid';
import { uniq, sortBy } from 'lodash';
import { formatError } from '../../lib/utils';
import { GlobalSettings } from '../globalSettings/globalSettings.collection';
import { NLUModels } from './nlu_model.collection';
import {
    getExamples,
    insertExamples,
    deleteExamples,
    switchCanonical,
    updateExamples,
} from '../graphql/examples/mongo/examples';
import { publishIntentsOrEntitiesChanged } from '../graphql/examples/resolvers/examplesResolver';
import { Projects } from '../project/project.collection';
import { checkIfCan } from '../../lib/scopes';

const gazetteDefaults = {
    mode: 'ratio',
    minScoreDefault: 80,
};

const getProjectIdFromModelId = modelId => NLUModels.findOne({ _id: modelId }).projectId;


Meteor.methods({
    async 'nlu.saveExampleChanges'(projectId, language, examples) {
        checkIfCan('nlu-data:w', projectId);
        check(projectId, String);
        check(language, String);
        check(examples, Array);

        const edited = [];
        const newExamples = [];
        const canonicalEdited = [];
        const deleted = [];

        examples.forEach((ex) => {
            // no drafts here
            const example = { ...ex, metadata: { ...ex.metadata, draft: false } };
            if (example.deleted) {
                if (!example.isNew) deleted.push(example._id);
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
                canonicalEdited.push({
                    ...example,
                    metadata: {
                        ...example.metadata,
                        canonical: !example?.metadata?.canonical,
                    },
                });
            }
        });
        await deleteExamples({ ids: deleted });
        await insertExamples({
            examples: newExamples,
            language,
            projectId,
            options: { autoAssignCanonical: !canonicalEdited.length },
        });
        await updateExamples({ examples: edited });
        canonicalEdited.forEach(example => switchCanonical({ projectId, language, example }));
        publishIntentsOrEntitiesChanged(projectId, language);
    },

    'nlu.upsertEntitySynonym'(modelId, item) {
        const projectId = getProjectIdFromModelId(modelId);
        checkIfCan('nlu-data:w', projectId);
        check(modelId, String);
        check(item, Object);

        if (item._id) {
            return NLUModels.update(
                { _id: modelId, 'training_data.entity_synonyms._id': item._id },
                { $set: { 'training_data.entity_synonyms.$': item } },
            );
        }

        return NLUModels.update(
            { _id: modelId },
            { $push: { 'training_data.entity_synonyms': { _id: uuidv4(), ...item } } },
        );
    },

    'nlu.deleteEntitySynonym'(modelId, itemId) {
        const projectId = getProjectIdFromModelId(modelId);
        checkIfCan('nlu-data:w', projectId);
        check(modelId, String);
        check(itemId, String);

        return NLUModels.update(
            { _id: modelId },
            { $pull: { 'training_data.entity_synonyms': { _id: itemId } } },
        );
    },

    'nlu.upsertEntityGazette'(modelId, item) {
        const projectId = getProjectIdFromModelId(modelId);
        checkIfCan('nlu-data:w', projectId);
        check(modelId, String);
        check(item, Object);

        if (item._id) {
            return NLUModels.update(
                { _id: modelId, 'training_data.fuzzy_gazette._id': item._id },
                { $set: { 'training_data.fuzzy_gazette.$': item } },
            );
        }

        const gazette = { _id: uuidv4(), ...gazetteDefaults, ...item };

        return NLUModels.update(
            { _id: modelId },
            { $push: { 'training_data.fuzzy_gazette': gazette } },
        );
    },

    'nlu.deleteEntityGazette'(modelId, itemId) {
        const projectId = getProjectIdFromModelId(modelId);
        checkIfCan('nlu-data:w', projectId);
        check(modelId, String);
        check(itemId, String);

        return NLUModels.update(
            { _id: modelId },
            { $pull: { 'training_data.fuzzy_gazette': { _id: itemId } } },
        );
    },

    'nlu.upsertRegexFeature'(modelId, item) {
        check(modelId, String);
        check(item, Object);
        if (item._id) {
            return NLUModels.update(
                { _id: modelId, 'training_data.regex_features._id': item._id },
                {
                    $set: {
                        'training_data.regex_features.$': item,
                    },
                },
            );
        }

        const regexFeature = { ...item, _id: uuidv4() };
        return NLUModels.update(
            { _id: modelId },
            { $push: { 'training_data.regex_features': regexFeature } },
        );
    },

    'nlu.deleteRegexFeature'(modelId, itemId) {
        check(modelId, String);
        check(itemId, String);
        console.log(itemId);
        return NLUModels.update(
            { _id: modelId },
            { $pull: { 'training_data.regex_features': { _id: itemId } } },
        );
    },
});

if (Meteor.isServer) {
    const getChitChatProjectid = () => {
        const {
            settings: { public: { chitChatProjectId = null } = {} } = {},
        } = GlobalSettings.findOne(
            {},
            { fields: { 'settings.public.chitChatProjectId': 1 } },
        );
        return chitChatProjectId;
    };

    const filterExistent = (current, toImport, identifier, defaultsToInsert) => {
        // identifier is a selected key to determine sameness, for example nlu example 'text'
        const toFilter = {};
        current.forEach((item) => {
            toFilter[item[identifier]] = true;
        }); // keep hashmap of existing items by chosen identifier
        const addToKeys = (input, curr) => {
            toFilter[curr[identifier]] = true;
            return input;
        };
        return toImport.reduce(
            (acc, curr) => (curr[identifier] in toFilter // if item with same identifier exists
                ? acc // pass
                : addToKeys(
                    [...acc, { ...curr, ...defaultsToInsert, _id: uuidv4() }],
                    curr,
                )), // else add example, giving it new id, and add to hashmap
            [],
        );
    };

    Meteor.methods({
        'nlu.insert'(projectId, language, incomingConfig = null) {
            checkIfCan('nlu-data:w', projectId);
            check(projectId, String);
            check(language, String);
            check(incomingConfig, Match.Maybe(String));

            const { languages } = Projects.findOne(
                { _id: projectId },
                { fields: { languages: 1 } },
            );
            if (languages.includes(language)) {
                throw new Meteor.Error(
                    '409',
                    `Model with language '${language}' already exists`,
                );
            }

            let config = incomingConfig;
            if (!incomingConfig) {
                const {
                    settings: {
                        public: { defaultNLUConfig },
                    },
                } = GlobalSettings.findOne(
                    {},
                    { fields: { 'settings.public.defaultNLUConfig': 1 } },
                );
                config = defaultNLUConfig;
            }
            const modelId = NLUModels.insert({ projectId, language, config });
            Projects.update(
                { _id: projectId },
                { $addToSet: { languages: language } },
            );
            return modelId;
        },

        'nlu.update.general'(modelId, item) {
            const projectId = getProjectIdFromModelId(modelId);
            checkIfCan('nlu-data:w', projectId);
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

        'nlu.remove'(projectId, language) {
            checkIfCan('nlu-data:w', projectId);
            check(language, String);
            check(projectId, String);
            // check the default language of project and the language of model
            const projectDefaultLanguage = Projects.findOne({ _id: projectId });
            if (language !== projectDefaultLanguage.defaultLanguage) {
                try {
                    NLUModels.remove({ projectId, language });
                    return Projects.update(
                        { _id: projectId },
                        { $pull: { languages: language } },
                    );
                } catch (e) {
                    throw e;
                }
            }
            throw new Meteor.Error('409', 'The default language cannot be deleted');
        },

        async 'nlu.getChitChatIntents'(language) {
            check(language, String);
            const projectId = getChitChatProjectid();
            if (!projectId) { throw ReferenceError('Chitchat project not set in global settings'); }
            const { examples = [] } = await getExamples({
                pageSize: -1,
                projectId,
                language,
            });
            return sortBy(uniq(examples.map(e => e.intent)));
        },

        async 'nlu.addChitChatToTrainingData'(projectId, language, intents) {
            checkIfCan('nlu-data:w', projectId);
            check(projectId, String);
            check(language, String);
            check(intents, [String]);

            const chitchatId = getChitChatProjectid();
            if (!chitchatId) { throw ReferenceError('Chitchat project not set in global settings'); }

            const { examples = [] } = await getExamples({
                pageSize: -1,
                projectId: chitchatId,
                language,
                intents,
            });

            insertExamples({ examples, language, projectId });
        },

        async 'nlu.import'(
            nluData,
            projectId,
            language,
            overwrite,
            canonicalExamples = [],
        ) {
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
                const currentModel = NLUModels.findOne(
                    { projectId, language },
                    { fields: { training_data: 1 } },
                );
                const { examples: currentExamples = [] } = await getExamples({
                    pageSize: -1,
                    projectId,
                    language,
                });
                let commonExamples;
                let entitySynonyms;
                let fuzzyGazette;

                if (nluData.common_examples && nluData.common_examples.length > 0) {
                    commonExamples = nluData.common_examples.map(e => ({
                        ...e,
                        _id: uuidv4(),
                        metadata: { canonical: canonicalExamples.includes(e.text) },
                    }));
                    if (overwrite) { await deleteExamples(currentExamples.map(({ _id }) => _id)); }
                    commonExamples = overwrite
                        ? commonExamples
                        : filterExistent(currentExamples, commonExamples, 'text');
                }

                if (nluData.entity_synonyms && nluData.entity_synonyms.length > 0) {
                    entitySynonyms = nluData.entity_synonyms.map(e => ({
                        ...e,
                        _id: uuidv4(),
                    }));
                    entitySynonyms = {
                        'training_data.entity_synonyms': overwrite
                            ? entitySynonyms
                            : {
                                $each: filterExistent(
                                    currentModel.training_data.entity_synonyms,
                                    entitySynonyms,
                                    'value',
                                ),
                                $position: 0,
                            },
                    };
                }

                let gazetteKey;
                if (nluData.fuzzy_gazette && nluData.fuzzy_gazette.length > 0) { gazetteKey = 'fuzzy_gazette'; }
                if (nluData.gazette && nluData.gazette.length > 0) gazetteKey = 'gazette';

                if (gazetteKey) {
                    fuzzyGazette = nluData[gazetteKey].map(e => ({
                        ...e,
                        _id: uuidv4(),
                    }));
                    fuzzyGazette = {
                        'training_data.fuzzy_gazette': overwrite
                            ? fuzzyGazette
                            : {
                                $each: filterExistent(
                                    currentModel.training_data.fuzzy_gazette,
                                    fuzzyGazette,
                                    'value',
                                    gazetteDefaults,
                                ),
                                $position: 0,
                            },
                    };
                }

                const op = overwrite
                    ? { $set: { ...entitySynonyms, ...fuzzyGazette } }
                    : { $push: { ...entitySynonyms, ...fuzzyGazette } };
                await insertExamples({
                    language, projectId, examples: commonExamples, options: { overwriteOnSameText: true },
                });
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
                    languages: [],
                });

                await Promise.all(
                    Object.keys(data).map(
                        lang => new Promise(async (resolve) => {
                            await Meteor.callWithPromise(
                                'nlu.insert',
                                projectId,
                                lang,
                            );
                            await insertExamples({
                                examples: data[lang],
                                language: lang,
                                projectId,
                            });
                            resolve();
                        }),
                    ),
                );

                GlobalSettings.update(
                    { _id: 'SETTINGS' },
                    { $set: { 'settings.public.chitChatProjectId': projectId } },
                );
            } catch (e) {
                throw formatError(e);
            }
        },
    });
}
