
import { determineDataType } from '../../../lib/importers/common';
import {
    loadBotfrontConfig, loadRasaConfig, loadConversations, loadIncoming, loadEndpoints, loadCredentials,
} from '../../../lib/importers/loadMisc.js';

function streamToString (stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
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
                
            return {
                filename,
                ...loadFile(files, file, rawText, params),
            };
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
        fileWithMessages, summary,
    };
}


export function importAll(files) {
    // files.map((file) => {
    //     type = determineDataType();
    // });
}


export function hasErrors(messages) {
    let containsErrors = false;
    messages.forEach((message) => {
        if (message.errors.length > 0) containsErrors = true;
    });
    return containsErrors;
}

// this function validate then import the files if there is not errors
// onlyValidate, noValidate are boolean switches to alter the steps of the validation
export async function importSteps(projectId, files, onlyValidate, noValidate) {
    const filesAndValidationData = await readAndValidate(files, { onlyValidate, noValidate, projectId });
    if (onlyValidate || hasErrors(filesAndValidationData)) return filesAndValidationData;
    const filesToImport = filesAndValidationData.filter();
    const importResult = importAll(filesToImport);
    return importResult;
}
