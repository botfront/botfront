
import { determineDataType } from '../../../lib/importers/common';
import {
    loadBotfrontConfig, loadRasaConfig, loadConversations, loadIncoming, loadEndpoints, loadCredentials, doValidation,
} from '../../../lib/importers/loadMisc.js';
import {
    loadDomain,
} from '../../../lib/importers/loadDomain.js';
import { handleImportAll } from './fileImporters';
import Project from './project.model';

function streamToString (stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}


// generate a array of info messages that says what will be imported
// the number of stories, of storiy-groups etc
export function generateSummary(files) {
    // TODO
    return null;
}
// dispatch file to correct loader and check for errors
export function loadFile(file, params) {
    const { dataType } = file;
    if (dataType === 'domain') {
        return loadDomain({ file, params });
    }
    // if (dataType === 'stories') {
    //     return addStoryFile({ file, ...params });
    // }
    // if (dataType === 'nlu') {
    //     return addNluFile({ file, ...params });
    // }
    if (dataType === 'conversations') {
        return loadConversations({ file, params });
    }
    if (dataType === 'incoming') {
        return loadIncoming({ file, params });
    }
    if (dataType === 'bfconfig') {
        return loadBotfrontConfig({ file, params });
    }
    if (dataType === 'rasaconfig') {
        return loadRasaConfig({ file, params });
    }
    if (dataType === 'endpoints') {
        return loadEndpoints({ file, params });
    }
    if (dataType === 'credentials') {
        return loadCredentials({ file, params });
    }
    return { file, errors: ['unknown file format'] };
}

// extract the raw text from the files and infer types
// if there is a bfconfig file it process it, because we need the data from that file for the validation later
// (eg: the default domain, the project languages)
export async function getRawTextAndType(files, params) {
    const projectConfig = null;
    const filesDataAndTypes = await Promise.all(files.map(async (file) => {
        const { filename } = file;
        if (file.filename.match(/\.(yml|json|md)/)) {
            const rawText = await streamToString(file.createReadStream());
            if (/\ufffd/.test(rawText)) { // out of range char test
                return {
                    file,
                    filename,
                    errors: ['file is not parseable text'],
                };
            }
            
            const dataType = determineDataType(file, rawText);
            if (dataType === 'bfconfig' && projectConfig === null) { // that way we take the first file if there are multiple project files
                const bfconfig = loadBotfrontConfig({ file: { file, rawText }, params });
                return {
                    filename,
                    rawText,
                    dataType,
                    ...bfconfig,
                };
            }
            return {
                file,
                filename,
                rawText,
                dataType,
            };
        }
        return {
            filename,
            file,
            errors: ['file is neither .json or.yaml or .md'],
        };
    }));

    return { filesDataAndTypes, projectConfig };
}

// validateFil
function validateFiles(files, params) {
    // conflictsTracker, keep track of the file that should be unique, or in limited number
    // keyed on the dataType that correspond to an array of filename,
    // e.g {'credentials': [credentials.yaml, credentials.production.yaml]}
    const conflictsTracker = {
        credentials: [], endpoints: [], rasaconfig: [], botfrontconfig: [], domain: [],
    };
    // the dataTypes that are sensible to conflicts

    const conflictsSensiblesType = ['credentials', 'endpoints', 'rasaconfig', 'botfrontconfig', 'domain'];

    const fileWithMessages = files.map((file) => {
        const newFileData = loadFile(file, params);
        const { dataType } = newFileData;
        if (doValidation(params) && conflictsSensiblesType.includes(dataType)) {
            if (conflictsTracker[dataType] && conflictsTracker[dataType].length === 1) {
                if (conflictsTracker[dataType] === 'rasaconfig') {
                    newFileData.warnings = [...(newFileData.warnings || []), `Policies from this file conflicts with policies from ${conflictsTracker[dataType][0]}, and thus they won't be used in the import`];
                } else if (conflictsTracker[dataType] === 'domain') {
                    newFileData.warnings = [...(newFileData.warnings || []), 'You have multiple domain files if some data conflicts, the one from the first file with that data will be used'];
                } else {
                    newFileData.warnings = [...(newFileData.warnings || []), `Conflicts with ${conflictsTracker[dataType][0]}, and thus won't be used in the import`];
                    newFileData.conflicts = true;
                }
            } else {
                conflictsTracker[dataType].push(file.filename);
            }
        }
        return newFileData;
    });
    return fileWithMessages;
}


export async function readAndValidate(files, params) {
    let projectLanguages = null;
    let defaultDomain = null;

    // get raw text and type from every file, also check if there is project data in the import
    const { filesDataAndTypes, projectConfig } = await getRawTextAndType(files, params);
    if (projectConfig === null) {
        const project = await Project.findOne({ _id: params.projectId }).lean();
        projectLanguages = project.languages;
        ({ defaultDomain } = project);
    } else {
        projectLanguages = projectConfig.languages;
        ({ defaultDomain } = projectConfig);
    }
    const fileWithMessages = validateFiles(filesDataAndTypes, { ...params, defaultDomain, projectLanguages });
  
    let summary = {};
    if (!params.noValidate) {
        // generateSummary generate the summary of what will be imported
        // eg: 50 stories...
        summary = generateSummary(fileWithMessages);
    }
    return {
        fileMessages: fileWithMessages, summary,
    };
}

export function hasErrors(messages) {
    let containsErrors = false;
    messages.forEach((message) => {
        if (message.errors && message.errors.length > 0) containsErrors = true;
    });
    return containsErrors;
}

// this function validate then import the files if there is not errors
// onlyValidate, noValidate are boolean switches to alter the steps of the validation
export async function importSteps(projectId, files, onlyValidate, noValidate, wipeCurrent) {
    const filesAndValidationData = await readAndValidate(files, { onlyValidate, noValidate, projectId });
    if (onlyValidate || hasErrors(filesAndValidationData.fileMessages)) return filesAndValidationData;
    const filesToImport = filesAndValidationData.fileMessages;
    const importResult = await handleImportAll(filesToImport, { wipeCurrent, projectId });
    return { summary: importResult };
}
