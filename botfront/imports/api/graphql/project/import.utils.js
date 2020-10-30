
import { determineDataType } from '../../../lib/importers/common';
import {
    validateEndpoints,
    validateCredentials,
    validateIncoming,
    validateConversations,
    validateInstances,
} from '../../../lib/importers/validateMisc.js';
import {
    validateRasaConfig,
} from '../../../lib/importers/validateRasaConfig.js';
import {
    validateDomain, validateDefaultDomains,
} from '../../../lib/importers/validateDomain.js';
import {
    validateTrainingData,
} from '../../../lib/importers/validateTrainingData.js';
import { handleImportAll } from './fileImporters';


function streamToString (stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}


// extract the raw text from the files and infer types
// if there is a bfconfig file it process it, because we need the data from that file for the validation later
// (eg: the default domain, the project languages)
export async function getRawTextAndType(files) {
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

            return {
                file,
                filename,
                rawText,
                dataType: determineDataType(file, rawText),
            };
        }
        return {
            filename,
            file,
            errors: ['file is neither .json or.yaml or .md'],
        };
    }));

    return filesDataAndTypes;
}

// validateFil
function validateFiles(files, params) {
    let filesWithMessages = files;
    let newParams = { ...params, summary: [] };
    // this is the validation pipeline each step only add errors to the files it should validate
    // each step can also add data to the params, eg : the default domain, the summary of changes etc,
    ([filesWithMessages, newParams] = validateDefaultDomains(filesWithMessages, newParams));
    ([filesWithMessages, newParams] = validateRasaConfig(filesWithMessages, newParams));
    ([filesWithMessages, newParams] = validateInstances(filesWithMessages, newParams));
    ([filesWithMessages, newParams] = validateEndpoints(filesWithMessages, newParams));
    ([filesWithMessages, newParams] = validateCredentials(filesWithMessages, newParams));
    ([filesWithMessages, newParams] = validateDomain(filesWithMessages, newParams));
    ([filesWithMessages, newParams] = validateConversations(filesWithMessages, newParams));
    ([filesWithMessages, newParams] = validateIncoming(filesWithMessages, newParams));
    ([filesWithMessages, newParams] = validateTrainingData(filesWithMessages, newParams));


    return [filesWithMessages, newParams];
}


export async function readAndValidate(files, params) {
    // get raw text and type from every file,
    const filesDataAndTypes = await getRawTextAndType(files, params);

    // send all file to the validation pipeline
    const [fileWithMessages, finalParams] = validateFiles(filesDataAndTypes, params);
    
   
    return {
        fileMessages: fileWithMessages, summary: finalParams.summary, params: finalParams,
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
export async function importSteps(projectId, files, onlyValidate, wipeCurrent) {
    const filesAndValidationData = await readAndValidate(files, { onlyValidate, projectId, wipeCurrent });
    if (onlyValidate || hasErrors(filesAndValidationData.fileMessages)) return filesAndValidationData;
    const { fileMessages: filesToImport, params } = filesAndValidationData;
    const importResult = await handleImportAll(filesToImport, params);
    return { summary: importResult };
}
