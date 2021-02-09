/* eslint-disable camelcase */
import { safeLoad, safeDump } from 'js-yaml';
import uuidv4 from 'uuid/v4';
import botResponses from '../botResponses/botResponses.model';
import { createEndpoints } from '../../endpoints/endpoints.methods';
import Conversations from '../conversations/conversations.model';
import Activity from '../activity/activity.model';
import { indexBotResponse } from '../botResponses/mongo/botResponses';
import { Slots } from '../../slots/slots.collection';
import { Projects } from '../../project/project.collection';
import {
    mergeDomains,
    deduplicateAndMergeResponses,
    deduplicateArray,
} from '../../../lib/importers/validateDomain';
import { Credentials, createCredentials } from '../../credentials';
import { GlobalSettings } from '../../globalSettings/globalSettings.collection';
import { Endpoints } from '../../endpoints/endpoints.collection';
import { Stories } from '../../story/stories.collection';
import { StoryGroups } from '../../storyGroups/storyGroups.collection';
import AnalyticsDashboards from '../analyticsDashboards/analyticsDashboards.model';
import handleImportTrainingData from './trainingDataFileImporter';
import Examples from '../examples/examples.model';
import FormResults from '../forms/form_results.model';
import { defaultDashboard } from '../analyticsDashboards/generateDefaults';

import { NLUModels } from '../../nlu_model/nlu_model.collection';
import { onlyValidFiles } from '../../../lib/importers/common';
import { getGraphElementsFromDomain } from '../../../lib/form.utils';
import { getForms, upsertForm, deleteForms } from '../forms/mongo/forms';

const handleImportBfForms = async (bfForms = [], projectId) => {
    const existingStoryGroups = await StoryGroups.find(
        { projectId, smartGroup: { $exists: false } },
        { fields: { _id: 1, name: 1 } },
    ).fetch();
    const res = await Promise.all(
        bfForms.map(async ({ groupName = 'forms', _id, ...form }) => {
            const { _id: groupId } = existingStoryGroups.find(
                ({ name }) => name === groupName,
            );
            const graphElements = getGraphElementsFromDomain(
                form.graph_elements,
                form.slots,
            );
            return upsertForm(
                {
                    form: {
                        ...form,
                        projectId,
                        groupId,
                        graph_elements: graphElements,
                    },
                },
                true,
            );
        }),
    );
    if (!res) throw new Error('Forms not inserted.');
    const notUpserted = [];
    res.forEach(({ status }, index) => {
        if (status === 'failed') {
            notUpserted.push(bfForms[index].name);
        }
    });
    if (notUpserted.length) {
        throw new Error(`Forms ${notUpserted.join(', ')} not inserted.`);
    }
    return true;
};

const handleWipeBfForms = async (projectId) => {
    try {
        const forms = await getForms(projectId);
        const deletedForms = await deleteForms({
            projectId,
            ids: forms.map(({ _id }) => _id),
        });
        if (
            !forms.every(({ _id }) => deletedForms.find(({ _id: deletedId }) => _id === deletedId))
        ) {
            throw new Error();
        }
    } catch (e) {
        throw new Error('Could not wipe the forms.');
    }
};

export const handleImportForms = async (regularForms, bfForms, projectId) => {
    const forms = regularForms;
    const version = await handleImportBfForms(bfForms, projectId);
    if (version === 'CE') {
        // merge them in with the others
        bfForms.forEach((bfForm) => {
            forms[bfForm.name] = bfForm;
        });
    }
    const { defaultDomain } = Projects.findOne({ _id: projectId });
    const parsedDefaultDomain = safeLoad(defaultDomain.content);
    const newForms = { ...(parsedDefaultDomain?.forms || {}), ...forms };
    if (Object.keys(newForms).length) parsedDefaultDomain.forms = newForms;
    const newDefaultDomain = safeDump(parsedDefaultDomain);
    await Meteor.callWithPromise('project.update', {
        defaultDomain: { content: newDefaultDomain },
        _id: projectId,
    });
};

export const handleImportActions = async (actions, projectId) => {
    const { defaultDomain } = Projects.findOne({ _id: projectId });
    const parsedDomain = safeLoad(defaultDomain.content);
    const newActions = deduplicateArray([...(parsedDomain?.actions || []), ...actions]);
    parsedDomain.actions = newActions;
    const newDomain = safeDump(parsedDomain);
    await Meteor.callWithPromise('project.update', {
        defaultDomain: { content: newDomain },
        _id: projectId,
    });
};
export const handleImportResponse = async (responses, projectId) => {
    const insertResponses = responses.map(async (resp) => {
        const existing = await botResponses.findOne({ key: resp.key, projectId }).lean();
        if (existing) {
            const newResponse = deduplicateAndMergeResponses([resp, existing])[0];
            return botResponses.update(
                { key: resp.key, projectId },
                { ...newResponse, textIndex: indexBotResponse(newResponse) },
            );
        }
        return botResponses.create({
            ...resp,
            textIndex: indexBotResponse(resp),
            _id: uuidv4(),
            projectId,
        });
    });
    await Promise.all(insertResponses);
};

const wipeDomain = async (projectId) => {
    try {
        await botResponses.deleteMany({ projectId });
    } catch (e) {
        throw new Error('Could not wipe the old responses.');
    }

    try {
        await Slots.remove({ projectId });
    } catch (e) {
        throw new Error('Could not wipe the slots responses.');
    }
    await handleWipeBfForms(projectId);
    return true;
};

// empty or bring back to default project data
// we do not reset the instance as the import depends on rasa for certain part of the import
// reseting it to default does not make sens
// no-unused-vars is used here so the signature is the same on os and ee
// eslint-disable-next-line no-unused-vars
const resetProject = async (projectId, { projectLanguages, fallbackLang }) => {
    try {
        const smartGroups = (await StoryGroups.find(
            { projectId, smartGroup: { $exists: true } },
            { fields: { id: 1 } },
        ).fetch() || []).map(({ _id }) => _id);
        wipeDomain(projectId);
        await Conversations.deleteMany({ projectId });
        await Activity.deleteMany({ projectId });
        await Credentials.remove({ projectId });
        await Endpoints.remove({ projectId });
        await Stories.remove({ projectId });
        await StoryGroups.remove({ projectId, smartGroup: { $exists: false } });
        await NLUModels.remove({ projectId });
        await FormResults.remove({ projectId });
        await AnalyticsDashboards.remove({ projectId });
        await Examples.deleteMany({ projectId });
        await createCredentials({ _id: projectId });
        await createEndpoints({ _id: projectId });
        AnalyticsDashboards.create(defaultDashboard({ _id: projectId, defaultLanguage: fallbackLang }));
        const {
            settings: {
                private: { defaultDefaultDomain },
            },
        } = GlobalSettings.findOne(
            {},
            { fields: { 'settings.private.defaultDefaultDomain': 1 } },
        );
        // we empty the languages supported by the project as we will be re-creating those
        // otherwise nlu.insert will not work as it would believe that some language we are trying to insert are already supported
        // moreover that way if a nlu.insert fails we won't have any unsupported languages in project
        await Projects.update(
            { _id: projectId },
            {
                $set: {
                    languages: [],
                    storyGroups: smartGroups,
                    defaultDomain: { content: defaultDefaultDomain },
                    chatWidgetSettings: {},
                },
            },
        );
        await Promise.all(
            projectLanguages.map(lang => Meteor.callWithPromise('nlu.insert', projectId, lang)),
        );
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log('e', e);
        throw new Error(`Could not reset the project back to default : ${e.message}`);
    }
    return true;
};

export const handleImportDomain = async (
    files,
    { projectId, wipeInvolvedCollections },
) => {
    if (!files.length) return [];
    const {
        slots, responses, forms, bfForms, actions,
    } = mergeDomains(files);

    if (wipeInvolvedCollections) {
        await wipeDomain(projectId);
    }
    const errors = [];
    const insert = async () => {
        try {
            if (responses && responses.length > 0) {
                await handleImportResponse(responses, projectId);
            }
        } catch (e) {
            errors.push(`error when importing responses: ${e.message}`);
        }
        try {
            if (slots && slots.length > 0) {
                await Meteor.callWithPromise('slots.upsert', slots, projectId);
            }
        } catch (e) {
            errors.push(`error when importing slots: ${e.message}`);
        }
        try {
            if (Object.keys(forms || {}).length || bfForms.length) {
                await handleImportForms(forms, bfForms, projectId);
            }
        } catch (e) {
            errors.push(`error when importing forms: ${e.message}`);
        }
        try {
            if (actions && actions.length > 0) {
                await handleImportActions(actions, projectId);
            }
        } catch (e) {
            errors.push(`error when importing actions: ${e.message}`);
        }
    };

    await insert();
    return errors;
};

export const handleImportDefaultDomain = async (
    files,
    { projectId, defaultDomain: jsDefaultDomain },
) => {
    if (!files.length) return [];
    const defaultDomain = { content: safeDump(jsDefaultDomain) };
    try {
        await Meteor.callWithPromise('project.update', { defaultDomain, _id: projectId });
        return [];
    } catch (e) {
        const nameList = files.map(f => f.filename).join(', ');
        return [`error when importing default domain from ${nameList}`];
    }
};

export const handleImportBfConfig = async (files, { projectId }) => {
    if (!files.length) return [];
    const toImport = files[0]; // we use the first file, as there could be only one config
    const { bfconfig } = toImport;
    const { instance, ...bfconfigData } = bfconfig;
    // all we want to be sure to not import one of those keys as it could break the import other parts (stories, models or defaultdomain)
    delete bfconfigData.chatWidgetSettings;
    delete bfconfigData.training;
    delete bfconfigData.disabled;
    delete bfconfigData.enableSharing;
    delete bfconfigData._id;
    delete bfconfigData.defaultDomain;
    delete bfconfigData.storyGroups;
    delete bfconfigData.languages;

    const errors = [];
    if (instance) {
        try {
            await Meteor.callWithPromise('instance.update', { ...instance, projectId });
        } catch (e) {
            errors.push(`error when importing instance from ${toImport.filename}`);
        }
    }
    if (bfconfigData) {
        try {
            await Meteor.callWithPromise('project.update', {
                ...bfconfigData,
                _id: projectId,
            });
        } catch (e) {
            errors.push(
                `error when importing project data from  ${toImport.filename}: ${e.message}`,
            );
        }
    }
    return errors;
};

export const handleImportEndpoints = async (files, { supportedEnvs, projectId }) => {
    if (!files.length) return [];
    const importedEnv = new Set();
    const toImport = files.filter((f) => {
        const { env } = f;
        if (supportedEnvs.includes(env) && !importedEnv.has(env)) {
            importedEnv.add(env);
            return true;
        }
        return false;
    });
    const importResult = await Promise.all(
        toImport.map(async (f) => {
            try {
                const { env, rawText } = f;
                if (supportedEnvs.includes(env)) {
                    await Meteor.callWithPromise('endpoints.save', {
                        environment: env,
                        projectId,
                        endpoints: rawText,
                    });
                }
                return null;
            } catch (e) {
                return `error when importing ${f.filename}: ${e.message}`;
            }
        }),
    );
    return importResult.filter(r => r);
};

export const handleImportCredentials = async (files, { supportedEnvs, projectId }) => {
    if (!files.length) return [];
    const importedEnv = new Set();
    const toImport = files.filter((f) => {
        const { env } = f;
        if (supportedEnvs.includes(env) && !importedEnv.has(env)) {
            importedEnv.add(env);
            return true;
        }
        return false;
    });
    const importResult = await Promise.all(
        toImport.map(async (f) => {
            try {
                const { env, rawText } = f;
                if (supportedEnvs.includes(env)) {
                    await Meteor.callWithPromise('credentials.save', {
                        environment: env,
                        projectId,
                        credentials: rawText,
                    });
                }
                return null;
            } catch (e) {
                return `error when importing ${f.filename}`;
            }
        }),
    );
    // return only the results with data in it (if nothing bad happen it shoudl be and array of null)
    return importResult.filter(r => r);
};

export const handleImportAnalyticsConfig = async (files, { projectId }) => {
    if (!files.length) return [];
    const toImport = files[0]; // there could only be one file to import
    try {
        await AnalyticsDashboards.deleteOne({ projectId });
        await AnalyticsDashboards.create({ ...toImport.analytics, projectId, _id: uuidv4() });
        return [];
    } catch (e) {
        return [`error when importing ${toImport.filename}`];
    }
};

export const handleImportWidgetSettings = async (files, { projectId }) => {
    if (!files.length) return [];
    const toImport = files[0]; // there could only be one file to import
    try {
        await Meteor.callWithPromise('project.update', {
            chatWidgetSettings: toImport.widgetsettings,
            _id: projectId,
        });
        return [];
    } catch (e) {
        return [`error when importing ${toImport.filename}`];
    }
};


export const handleImportFromResults = async (files, { supportedEnvs, projectId, wipeInvolvedCollections }) => {
    if (!files.length) return [];
    if (wipeInvolvedCollections) {
        await FormResults.deleteMany({ projectId });
    }
    try {
        const importer = files.map(async (file) => {
            const { formresults, env } = file;
            if (supportedEnvs.includes(env)) {
                await Promise.all(formresults.map(async (result) => {
                    const { conversationId, date } = result;
                    return FormResults.updateOne(
                        {
                            conversationId, date, environment: env, projectId,
                        },
                        { ...result, date: new Date(result.date), environment: env },
                        { upsert: true },
                    );
                }));
            }
        });
        await Promise.all(importer);
        return [];
    } catch (e) {
        return [`error when importing form results: ${e.message}`];
    }
};
   

export const handleImportRasaConfig = async (files, { projectId, projectLanguages }) => {
    const languagesNotImported = new Set(projectLanguages);
    let policiesImported = false;
    const { languages: existingLanguages } = Projects.findOne({ _id: projectId });
    const pipelineImported = {};
    const errors = [];
    await files.reduce(async (previous, f) => {
        await previous;
        const { pipeline, policies, language } = f;
        // we only use the policies from the first one
        // this is something decided arbitrarily, there is a warning about it in validation so the user is aware of this behavior
        if (policies && !policiesImported) {
            try {
                await Meteor.callWithPromise('policies.save', {
                    policies: safeDump({ policies }),
                    projectId,
                });
                policiesImported = true;
            } catch (e) {
                console.log(e);
                errors.push(`error when importing policies from ${f.filename}`);
            }
        }
        if (pipeline && !pipelineImported[language]) {
            try {
                if (existingLanguages.includes(language)) {
                    await Meteor.callWithPromise(
                        'nlu.update.pipeline',
                        projectId,
                        language,
                        safeDump({ pipeline }),
                    );
                } else {
                    await Meteor.callWithPromise(
                        'nlu.insert',
                        projectId,
                        language,
                        safeDump({ pipeline }),
                    );
                }
                pipelineImported[language] = true;
                languagesNotImported.delete(language);
            } catch (e) {
                errors.push(`error when importing pipeline from ${f.filename}`);
            }
        }
        return Promise.resolve();
    }, Promise.resolve());

    const { languages } = await Projects.findOne({ _id: projectId });
    languages.forEach(lang => languagesNotImported.delete(lang));
    const createResult = await Promise.all(
        [...languagesNotImported].map(async (lang) => {
            try {
                await Meteor.callWithPromise('nlu.insert', projectId, lang);
                return null;
            } catch (e) {
                return `error when creating nlu model: ${e.message}`;
            }
        }),
    );
    // return only the results with data in it (if nothing bad happened it shoudl be an array of null)
    return [...errors, ...createResult].filter(r => r);
};

export const handleImportConversations = async (
    files,
    { supportedEnvs, projectId, wipeInvolvedCollections },
) => {
    if (!files.length) return [];
    if (wipeInvolvedCollections) {
        await Conversations.deleteMany({ projectId });
    }
    const importResult = await Promise.all(
        files.map(async (f) => {
            try {
                const { conversations, env } = f;
                if (supportedEnvs.includes(env)) {
                    const insertConv = conversations.map(async (conv) => {
                        const { _id, ...convRest } = conv;
                        const { sender_id } = conv?.tracker;
                        // we are looking conversation by the sender id because that is what define the user
                        // the id might have changed from a previous import
                        const exist = await Conversations.findOne({ 'tracker.sender_id': sender_id, projectId });
                       
                        if (exist) {
                            return Conversations.updateOne(
                                { 'tracker.sender_id': sender_id, projectId },
                                {
                                    $set: {
                                        ...convRest,
                                        projectId,
                                        env,
                                    },
                                },
                            );
                        }
                        return Conversations.create({ ...convRest, env, projectId });
                    });
                    await Promise.all(insertConv);
                }

                return null;
            } catch (e) {
                console.log(e);
                return `error when importing conversations form ${f.filename}: ${e.message}`;
            }
        }),
    );
    // return only the results with data in it (if nothing bad happen it should be an array of null)
    return importResult.filter(r => r);
};

export const handleImportIncoming = async (
    files,
    { supportedEnvs, projectId, wipeInvolvedCollections },
) => {
    if (!files.length) return [];
    if (wipeInvolvedCollections) {
        await Activity.deleteMany({ projectId });
    }
    const importResult = await Promise.all(
        files.map(async (f) => {
            try {
                const { incoming, env } = f;
                if (supportedEnvs.includes(env)) {
                    const insertIncoming = incoming.map(utterance => Activity.update(
                        { _id: utterance._id || uuidv4() },
                        {
                            ...utterance,
                            projectId,
                            env,
                        },
                        { upsert: true },
                    ));
                    await Promise.all(insertIncoming);
                }

                return null;
            } catch (e) {
                if (e.code === 11000) {
                    return `error when importing incoming from ${f.filename}, it seems that some of the data you are trying to import already exists`;
                }
                return `error when importing incoming from ${f.filename}`;
            }
        }),
    );
    // return only the results with data in it (if nothing bad happen it shoudl be and array of null)
    return importResult.filter(r => r);
};

// import all files in the array of files
// the files should have been processed before by the validation step
export const handleImportAll = async (files, params) => {
    const importers = [];
    const { projectId, wipeProject } = params;
    const toImport = onlyValidFiles(files);
    try {
        if (wipeProject) {
            await resetProject(projectId, params);
        }
        // this function is there to force the order of import: rasaconfig, default domain then domain
        // rasaconfig might add support for languages that have data in the domain
        // the default domain might be updated and importing the domain might add some data to it (eg. forms)
        // that why we want this order
        const configAndDomainImport = async () => {
            const rasaconfig = await handleImportRasaConfig(
                toImport.filter(f => f.dataType === 'rasaconfig'),
                params,
            );
            const configErrors = await handleImportDefaultDomain(
                toImport.filter(f => f.dataType === 'defaultdomain'),
                params,
            );
            const trainingDataErrors = await handleImportTrainingData(
                toImport.filter(f => f.dataType === 'training_data'),
                params,
            );
            const domainErrors = await handleImportDomain(
                toImport.filter(f => f.dataType === 'domain'),
                params,
            );
            return [
                ...rasaconfig,
                ...configErrors,
                ...trainingDataErrors,
                ...domainErrors,
            ];
        };

        importers.push(configAndDomainImport());
        importers.push(
            handleImportBfConfig(
                toImport.filter(f => f.dataType === 'bfconfig'),
                params,
            ),
        );
        importers.push(
            handleImportEndpoints(
                toImport.filter(f => f.dataType === 'endpoints'),
                params,
            ),
        );
        importers.push(
            handleImportCredentials(
                toImport.filter(f => f.dataType === 'credentials'),
                params,
            ),
        );

        importers.push(
            handleImportWidgetSettings(
                toImport.filter(f => f.dataType === 'widgetsettings'),
                params,
            ),
        );

        importers.push(
            handleImportConversations(
                toImport.filter(f => f.dataType === 'conversations'),
                params,
            ),
        );
        importers.push(
            handleImportIncoming(
                toImport.filter(f => f.dataType === 'incoming'),
                params,
            ),
        );
        importers.push(
            handleImportAnalyticsConfig(
                toImport.filter(f => f.dataType === 'analytics'),
                params,
            ),
        );

        importers.push(
            handleImportFromResults(
                toImport.filter(f => f.dataType === 'formresults'),
                params,
            ),
        );

        // importers return a arrays of array of errors, we flaten it and remove the null values
        return (await Promise.all(importers)).flat().filter(r => r);
    } catch (e) {
        return [e.message];
    }
};
