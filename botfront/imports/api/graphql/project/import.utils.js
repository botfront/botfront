
import { determineDataType } from '../../../lib/importers/common';
import {
    loadBotfrontConfig, loadRasaConfig, loadConversations, loadIncoming, loadEndpoints, loadCredentials, doValidation,
} from '../../../lib/importers/loadMisc.js';
import { handleImportAll } from './fileImporters';

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
export function loadFile(file, rawText, params) {
    const dataType = determineDataType(file, rawText);
    // if (dataType === 'domain') {
    //     return update(params.setFileList, file, loadDomain({ rawText, ...params }));
    // }
    // if (dataType === 'stories') {
    //     return addStoryFile({ file, rawText, ...params });
    // }
    // if (dataType === 'nlu') {
    //     return addNluFile({ file, rawText, ...params });
    // }
    if (dataType === 'conversations') {
        return loadConversations({ file, rawText, params });
    }
    if (dataType === 'incoming') {
        return loadIncoming({ file, rawText, params });
    }
    if (dataType === 'bfconfig') {
        return loadBotfrontConfig({ file, rawText, params });
    }
    if (dataType === 'rasaconfig') {
        return loadRasaConfig({ file, rawText, params });
    }
    if (dataType === 'endpoints') {
        return loadEndpoints({ file, rawText, params });
    }
    if (dataType === 'credentials') {
        return loadCredentials({ file, rawText, params });
    }
    return { file, errors: ['unknown file format'] };
}


export async function readAndValidate(files, params) {
    // conflictsTracker, keep track of the file that should be unique, or in limited number
    // keyed on the dataType that correspond to an array of filename,
    // e.g {'credentials': [credentials.yaml, credentials.production.yaml]}
    const conflictsTracker = {
        credentials: [], endpoints: [], rasaconfig: [], botfrontconfig: [],
    };
    // the dataTypes that are sensible to conflicts
    const conflictsSensiblesType = ['credentials', 'endpoints', 'rasaconfig', 'botfrontconfig'];
    const fileWithMessages = await Promise.all(files.map(async (file) => {
        const { filename } = file;
        if (file.filename.match(/\.(yml|json|md)/)) {
            const rawText = await streamToString(file.createReadStream());
            if (/\ufffd/.test(rawText)) { // out of range char test
                return {
                    file,
                    errors: ['file is not parseable text'],
                };
            }
            const newFileData = {
                filename,
                ...loadFile(file, rawText, params),
            };
            const { dataType } = newFileData;
            if (doValidation(params) && conflictsSensiblesType.includes(dataType)) {
                if (conflictsTracker[dataType] && conflictsTracker[dataType].length === 1) {
                    if (conflictsTracker[dataType] === 'rasaconfig') {
                        newFileData.warnings = [...(newFileData.warnings || []), `Policies from this file conflicts with policies from ${conflictsTracker[dataType][0]}, and thus they won't be used in the import`];
                    } else {
                        newFileData.warnings = [...(newFileData.warnings || []), `Conflicts with ${conflictsTracker[dataType][0]}, and thus won't be used in the import`];
                        newFileData.conflicts = true;
                    }
                } else {
                    conflictsTracker[dataType].push(filename);
                }
            }
            return newFileData;
        }
        return {
            filename,
            file,
            errors: ['file is neither .json or.yaml or .md'],
        };
    }));
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

// import all file in the array of files
// the files should have been processed before by the validation step
export async function importAll(files, params) {
    await handleImportAll(files, params);
    return null;
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
    const importResult = await importAll(filesToImport, { wipeCurrent, projectId });
    return importResult;
}
