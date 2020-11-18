import { safeLoad, safeDump } from 'js-yaml';
import botResponses from '../botResponses/botResponses.model';
import { saveEndpoints, createEndpoints } from '../../endpoints/endpoints.methods';
import Conversations from '../conversations/conversations.model';
import Activity from '../activity/activity.model';
import { indexBotResponse } from '../botResponses/mongo/botResponses';
import { Slots } from '../../slots/slots.collection';
import { Projects } from '../../project/project.collection';
import { mergeDomains, deduplicateAndMergeResponses } from '../../../lib/importers/validateDomain';
import { Credentials, createCredentials } from '../../credentials';


import { Endpoints } from '../../endpoints/endpoints.collection';
import { Stories } from '../../story/stories.collection';
import handleImportTrainingData from './trainingDataFileImporter';
import Examples from '../examples/examples.model';
import NLUModels from '../../nlu_model/nlu_model.collection';


export const handleImportForms = async (forms, projectId) => {
    const { defaultDomain } = Projects.findOne({ _id: projectId });
    const parsedDomain = safeLoad(defaultDomain.content);
    const newForms = { ...(parsedDomain?.forms || {}), ...forms };
    parsedDomain.forms = newForms;
    const newDomain = safeDump(parsedDomain);
    await Meteor.callWithPromise('project.update', {
        defaultDomain: { content: newDomain },
        _id: projectId,
    });
};


export const handleImportActions = async (actions, projectId) => {
    const { defaultDomain } = Projects.findOne({ _id: projectId });
    const parsedDomain = safeLoad(defaultDomain.content);
    const newForms = [...(parsedDomain?.actions || []), ...actions];
    parsedDomain.actions = newForms;
    const newDomain = safeDump(parsedDomain);
    await Meteor.callWithPromise('project.update', {
        defaultDomain: { content: newDomain },
        _id: projectId,
    });
};
export const handleImportResponse = async (responses, projectId) => {
    const preparedResponses = responses.map((response) => {
        const index = indexBotResponse(response);
        return { ...response, textIndex: index, projectId };
    });
    try {
        const insertResponses = preparedResponses.map(async (resp) => {
            const existing = await botResponses.findOne({ key: resp.key, projectId }).lean();
            if (existing) {
                const newResponse = deduplicateAndMergeResponses([resp, existing])[0];
                const newIndex = indexBotResponse(newResponse);
                await botResponses.update({ key: resp.key, projectId }, { ...newResponse, index: newIndex, projectId }, { upsert: true });
            } else {
                await botResponses.update({ key: resp.key, projectId }, resp, { upsert: true });
            }
        });
        await Promise.all(insertResponses);
    } catch (e) {
        if (e.code === 11000) {
            const alreadyExist = e?.result?.result?.writeErrors
                .map(err => `${err.err.op.key} already exist`)
                .join(', ');
            throw new Error(alreadyExist);
        }
        throw new Error(e);
    }
};

const wipeDomain = async (projectId) => {
    try {
        await botResponses.deleteMany({ projectId });
    } catch (e) {
        throw new Error('Could not wipe the old responses');
    }

    try {
        await Slots.remove({ projectId });
    } catch (e) {
        throw new Error('Could not wipe the slots responses');
    }
    return true;
};


const resetProject = async (projectId) => {
    try {
        wipeDomain(projectId);
        await Conversations.deleteMany({ projectId });
        await Activity.deleteMany({ projectId });
        await Credentials.remove({ projectId });
        await Endpoints.remove({ projectId });
        await Stories.remove({ projectId });
        await NLUModels.remove({ projectId });
        await Examples.deleteMany({ projectId });
        await createCredentials({ _id: projectId });
        await createEndpoints({ _id: projectId });
        const { languages } = await Projects.findOne({ _id: projectId });
        await Promise.all(languages.map(lang => Meteor.callWithPromise('nlu.insert', projectId, lang)));
    } catch (e) {
        throw new Error('Could not reset the project back to default');
    }
    return true;
};

export const handleImportDomain = async (files, { projectId, wipeInvolvedCollections }) => {
    if (!files.length) return [];
    const {
        slots, responses, forms, actions,
    } = mergeDomains(files);

    const errors = [];
    const insert = async () => {
        try {
            if (responses && responses.length > 0) { await handleImportResponse(responses, projectId); }
        } catch (e) {
            errors.push(`error when importing responses ${e.message}`);
        }
        try {
            if (slots && slots.length > 0) { await Meteor.callWithPromise('slots.upsert', slots, projectId); }
        } catch (e) {
            errors.push(`error when importing slots ${e.message}`);
        }
        try {
            if (forms) {
                await handleImportForms(forms, projectId);
            }
        } catch (e) {
            errors.push(`error when importing forms ${e.message}`);
        }
        try {
            if (actions && actions.length > 0) {
                await handleImportActions(actions, projectId);
            }
        } catch (e) {
            errors.push(`error when importing actions ${e.message}`);
        }
    };
  
    if (wipeInvolvedCollections) {
        await wipeDomain(projectId);
    }
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
        return [`error when import default domain from ${nameList}`];
    }
};

export const handleImportBfConfig = async (files, { projectId }) => {
    if (!files.length) return [];
    const toImport = files[0]; // we use the first file, as there could be only one instance
    const { bfconfig } = toImport;
    const { instance, ...bfconfigData } = bfconfig;
    const errors = [];
    try {
        await Meteor.callWithPromise('instance.update', { ...instance, projectId });
    } catch (e) {
        errors.push(`error when importing instance from ${toImport.filename}`);
    }
    try {
        await Meteor.callWithPromise('project.update', {
            ...bfconfigData,
            _id: projectId,
        });
    } catch (e) {
        errors.push(`error when importing project data from  ${toImport.filename}: ${e.message}`);
    }
    return errors;
};

export const handleImportEndpoints = async (files, { projectId }) => {
    if (!files.length) return [];
    const toImport = [files[0]]; // there could only be one file os, but the map is there for ee
    const importResult = await Promise.all(
        toImport.map(async (f) => {
            try {
                await saveEndpoints({
                    projectId,
                    endpoints: f.rawText,
                });
                return null;
            } catch (e) {
                return `error when importing ${f.filename}: ${e.message}`;
            }
        }),
    );
    return importResult.filter(r => r);
};

export const handleImportCredentials = async (files, { projectId }) => {
    if (!files.length) return [];
    const toImport = [files[0]]; // there could only be one file os, but the map is there for ee
    const importResult = await Promise.all(
        toImport.map(async (f) => {
            try {
                await Meteor.callWithPromise('credentials.save', {
                    projectId,
                    credentials: f.rawText,
                });
                return null;
            } catch (e) {
                return `error when importing ${f.filename}`;
            }
        }),
    );
    // return only the results with data in it (if nothing bad happen it shoudl be and array of null)
    return importResult.filter(r => r);
};

export const handleImportRasaConfig = async (files, { projectId, projectLanguages }) => {
    const languagesNotImported = new Set(projectLanguages);
    let policiesImported = false;
    const existingLanguages = Projects.findOne({ _id: projectId }).languages;
    const pipelineImported = {};
    const importResult = await Promise.all(
        files.map(async (f) => {
            const { pipeline, policies, language } = f;
            // we only use the policies from the first one
            // this is something decided arbitrarily, there is a warning about it in validation so the user aware of this behavior
            if (policies && !policiesImported) {
                try {
                    await Meteor.callWithPromise('policies.save', {
                        policies: safeDump(policies),
                        projectId,
                    });
                    policiesImported = true;
                } catch (e) {
                    return `error when importing policies from ${f.filename}`;
                }
            }
            if (pipeline && !pipelineImported[language]) {
                try {
                    if (existingLanguages.includes(language)) {
                        await Meteor.callWithPromise(
                            'nlu.update.pipeline',
                            projectId,
                            language,
                            safeDump(pipeline),
                        );
                    } else {
                        await Meteor.callWithPromise('nlu.insert', projectId, language, safeDump(pipeline));
                    }
                                       
                    languagesNotImported.delete(language);
                    return null;
                } catch (e) {
                    return `error when importing pipeline from ${f.filename}`;
                }
            }
            return null;
        }),
    );
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
    // return only the results with data in it (if nothing bad happen it shoudl be and array of null)
    return [...importResult, ...createResult].filter(r => r);
};

export const handleImportConversations = async (files, { projectId, wipeInvolvedCollections }) => {
    if (!files.length) return [];
    if (wipeInvolvedCollections) {
        await Conversations.deleteMany({ projectId });
    }
    const importResult = await Promise.all(
        files.map(async (f) => {
            try {
                const { conversations } = f;
                const insertConv = conversations.map(conv => Conversations.update(
                    { _id: conv._id },
                    { ...conv, projectId },
                    { upsert: true },
                ));
                await Promise.all(insertConv);
                return null;
            } catch (e) {
                if (e.code === 11000) {
                    return `error when importing conversations from ${f.filename}, it seems that some of the data you are trying to import already exists`;
                }
                return `error when importing conversations form ${f.filename}`;
            }
        }),
    );
    // return only the results with data in it (if nothing bad happen it shoudl be and array of null)
    return importResult.filter(r => r);
};

export const handleImportIncoming = async (files, { projectId, wipeInvolvedCollections }) => {
    if (!files.length) return [];
    if (wipeInvolvedCollections) {
        await Activity.deleteMany({ projectId });
    }
    const importResult = await Promise.all(
        files.map(async (f) => {
            try {
                const { incoming } = f;
                const insertIncoming = incoming.map(utterance => Activity.update(
                    { _id: utterance._id },
                    { ...utterance, projectId },
                    { upsert: true },
                ));
                await Promise.all(insertIncoming);
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

// import all file in the array of files
// the files should have been processed before by the validation step
export const handleImportAll = async (files, params) => {
    const importers = [];
    const { projectId, wipeProject } = params;
    if (wipeProject) {
        resetProject(projectId);
    }

    // this function is there to force the order of import: rasaconfig, default domain then domain
    // rasaconfig might add support for languages that have data in the domain
    // the default domain might be updated and importing the domain might add some data to it (eg. forms)
    // that why we want this order
    const configAndDomainImport = async () => {
        const rasaconfig = await handleImportRasaConfig(
            files.filter(f => f.dataType === 'rasaconfig'),
            params,
        );
        const configErrors = await handleImportDefaultDomain(
            files.filter(f => f.dataType === 'defaultdomain'),
            params,
        );
        const trainingDataErrors = await handleImportTrainingData(
            files.filter(f => f.dataType === 'training_data'),
            params,
        );
        const domainErrors = await handleImportDomain(
            files.filter(f => f.dataType === 'domain'),
            params,
        );
        return [...rasaconfig, ...configErrors, ...trainingDataErrors, ...domainErrors];
    };

    importers.push(configAndDomainImport());
    importers.push(
        handleImportBfConfig(
            files.filter(f => f.dataType === 'bfconfig'),
            params,
        ),
    );
    importers.push(
        handleImportEndpoints(
            files.filter(f => f.dataType === 'endpoints'),
            params,
        ),
    );
    importers.push(
        handleImportCredentials(
            files.filter(f => f.dataType === 'credentials'),
            params,
        ),
    );
    importers.push(
        handleImportConversations(
            files.filter(f => f.dataType === 'conversations'),
            params,
        ),
    );
    importers.push(
        handleImportIncoming(
            files.filter(f => f.dataType === 'incoming'),
            params,
        ),
    );
    // importers return a arrays of array of errors, we flaten it and remove the null values
    return (await Promise.all(importers)).flat().filter(r => r);
};
